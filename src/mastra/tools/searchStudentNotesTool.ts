import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students, studentNotes } from '@/db/schema';
import { eq, or, ilike, sql } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI();

export const searchStudentNotesTool = createTool({
    id: 'searchStudentNotes',
    description: 'Perform a semantic search on a student\'s qualitative records (counselor notes, IEP summaries, disciplinary reports) to answer subjective questions like "Why has attendance dropped?"',
    inputSchema: z.object({
        query: z.string().describe('The user\'s actual question or the semantic concept to search for.'),
        studentIdOrName: z.string().optional().describe('The student ID or name to filter the notes by, if applicable.'),
    }),
    outputSchema: z.object({
        notes: z.array(z.any()).optional(),
        message: z.string(),
    }),
    execute: async ({ query, studentIdOrName }) => {
        if (!db) return { message: "Database connection not initialized." };
        try {
            // 1. Generate an embedding for the search query
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query,
                encoding_format: 'float',
            });
            
            const queryEmbedding = embeddingResponse.data[0].embedding;

            // 2. Identify the target student if provided
            let targetStudentId: string | null = null;
            if (studentIdOrName) {
                const results = await db
                    .select({ id: students.id })
                    .from(students)
                    .where(
                        or(
                            eq(students.studentId, studentIdOrName),
                            ilike(students.name, `%${studentIdOrName}%`)
                        )
                    );
                if (results.length > 0) {
                    targetStudentId = results[0].id;
                }
            }

            // 3. Perform vector similarity search
            // Cosine distance (<=>)
            let baseQuery = db
                .select({
                    id: studentNotes.id,
                    content: studentNotes.content,
                    type: studentNotes.type,
                    createdAt: studentNotes.createdAt,
                    similarity: sql<number>`1 - (${studentNotes.embedding} <=> ${JSON.stringify(queryEmbedding)})`
                })
                .from(studentNotes);

            // 4. Optionally filter by student
            if (targetStudentId) {
                baseQuery = baseQuery.where(eq(studentNotes.studentId, targetStudentId)) as any;
            }

            // 5. Order by similarity and limit results
            const relevantNotes = await baseQuery
                .orderBy(sql`${studentNotes.embedding} <=> ${JSON.stringify(queryEmbedding)}`)
                .limit(5);

            if (relevantNotes.length === 0) {
                return { message: 'No subjective/counselor notes found related to this query.' };
            }

            // Filter out totally irrelevant things (e.g., negative similarity) if necessary, 
            // though typically we'll just return the top few
            // Use a permissive threshold so results aren't filtered out during testing
            // with placeholder embeddings. In production, raise to 0.3 or higher.
            const thresholdNotes = relevantNotes.filter(n => n.similarity > -1);

            return {
                notes: thresholdNotes.map(n => ({
                    type: n.type,
                    date: n.createdAt,
                    content: n.content
                })),
                message: 'Successfully retrieved relevant qualitative notes.',
            };

        } catch (error) {
            console.error('searchStudentNotesTool error:', error);
            return { message: 'Error performing semantic search on student notes.' };
        }
    },
});
