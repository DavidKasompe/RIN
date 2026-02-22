/**
 * src/lib/supabase-storage.ts
 *
 * Server-side only helper for uploading files to Supabase Storage.
 * Uses SUPABASE_SERVICE_ROLE_KEY — never expose this to the client.
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'user_artifacts';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            'Supabase storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
        );
    }

    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

/**
 * Upload a file buffer to the `user_artifacts` Supabase Storage bucket.
 *
 * @param buffer   - Raw file bytes
 * @param filename - Path/filename inside the bucket (should be unique, e.g. uuid-slug.pdf)
 * @param mimeType - MIME type string (e.g. 'application/pdf')
 * @returns        Public URL of the uploaded file
 */
export async function uploadToSupabaseStorage(
    buffer: Buffer,
    filename: string,
    mimeType: string,
): Promise<string> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    if (!data?.publicUrl) {
        throw new Error(`Failed to get public URL for: ${filename}`);
    }

    return data.publicUrl;
}
