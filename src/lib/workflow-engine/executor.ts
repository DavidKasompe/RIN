import { ExecutionResult, StepContext, WorkflowEdge, WorkflowNode } from "./types";
import { getStepImporter } from "./step-registry";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { eq, or } from "drizzle-orm";

type NodeOutputs = Record<string, { label: string; data: any }>;

export interface WorkflowExecutionInput {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggerInput?: Record<string, any>;
    executionId?: string;
    workflowId?: string;
}

// Simple template processor for {{@nodeId.field}} values
function processTemplates(config: Record<string, any>, outputs: NodeOutputs): Record<string, any> {
    const processed: Record<string, any> = {};

    for (const [key, value] of Object.entries(config)) {
        if (typeof value === "string") {
            const templatePattern = /\{\{@([^:]+):([^}]+)\}\}/g; // e.g. {{@node1:data.userEmail}}
            processed[key] = value.replace(templatePattern, (match, nodeId, fieldPath) => {
                const sanitizedNodeId = nodeId.replace(/[^a-zA-Z0-9]/g, "_");
                const output = outputs[sanitizedNodeId];

                if (!output || !output.data) return "";

                const fields = fieldPath.split('.');
                let current = output.data;
                for (const field of fields) {
                    if (current && typeof current === 'object') {
                        current = current[field];
                    } else {
                        return "";
                    }
                }

                if (typeof current === 'object') return JSON.stringify(current);
                return String(current);
            });
        } else {
            processed[key] = value;
        }
    }

    return processed;
}

// Safely evaluates a branch condition like "data.riskScore > 80"
function evaluateCondition(conditionExpression: string, config: Record<string, any>): boolean {
    if (!conditionExpression) return true;
    try {
        // Very basic safe evaluator, replacing bounded variables
        // A full implementation would use a sandboxed AST evaluator.
        const keys = Object.keys(config);
        const values = Object.values(config);
        // eslint-disable-next-line no-new-func
        const func = new Function(...keys, `return !!(${conditionExpression});`);
        return func(...values);
    } catch (e) {
        console.error("Failed to evaluate condition:", conditionExpression, e);
        return false;
    }
}

export async function executeWorkflow(input: WorkflowExecutionInput) {
    const { nodes, edges, triggerInput = {}, executionId } = input;

    const outputs: NodeOutputs = {};
    const results: Record<string, ExecutionResult> = {};

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edgesBySource = new Map<string, string[]>();

    for (const edge of edges) {
        if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
        edgesBySource.get(edge.source)!.push(edge.target);
    }

    // Find trigger nodes (no incoming edges)
    const nodesWithIncoming = new Set(edges.map(e => e.target));
    const triggerNodes = nodes.filter(n => n.data.type === 'trigger' && !nodesWithIncoming.has(n.id));

    async function executeNode(nodeId: string, visited: Set<string> = new Set()) {
        if (visited.has(nodeId)) return; // Prevent infinite loops
        visited.add(nodeId);

        const node = nodeMap.get(nodeId);
        if (!node) return;

        if (node.data.enabled === false) {
            outputs[nodeId] = { label: node.data.label || nodeId, data: null };
            const nextNodes = edgesBySource.get(nodeId) || [];
            await Promise.all(nextNodes.map(nId => executeNode(nId, visited)));
            return;
        }

        let result: ExecutionResult = { success: false };

        try {
            if (node.data.type === 'trigger') {
                // Combine mocked trigger config with real trigger input
                const triggerData = { ...(node.data.config || {}), ...triggerInput };
                result = { success: true, data: triggerData };
            } else if (node.data.type === 'action' || node.data.type === 'agent') {
                const config = node.data.config || {};
                const actionType = config.actionType;

                if (!actionType) throw new Error("No actionType defined for node");

                const processedConfig = processTemplates(config, outputs);
                const stepContext: StepContext = { executionId, nodeId: node.id, nodeName: node.data.label || '', nodeType: actionType };

                const importer = getStepImporter(actionType);
                if (importer) {
                    const module = await importer.importer();
                    const stepFn = module[importer.stepFunction];
                    if (stepFn) {
                        result = await stepFn({ ...processedConfig, _context: stepContext });
                    } else {
                        throw new Error(`Step function missing: ${importer.stepFunction}`);
                    }
                } else {
                    throw new Error(`Unknown action type: ${actionType}`);
                }
            } else if (node.data.type === 'condition') {
                const config = processTemplates(node.data.config || {}, outputs);
                const conditionExp = config.expression || 'false';
                const isTrue = evaluateCondition(conditionExp, config);
                result = { success: true, data: { condition: isTrue } };
            } else if (node.data.type === 'output') {
                const processedConfig = processTemplates(node.data.config || {}, outputs);
                result = { success: true, data: processedConfig };
            }
        } catch (err: any) {
            console.error(`Error executing node ${nodeId}:`, err);
            result = { success: false, error: err.message };
        }

        results[nodeId] = result;
        outputs[nodeId] = { label: node.data.label || nodeId, data: result.data };

        // Proceed to next nodes
        if (result.success) {
            const nextNodes = edgesBySource.get(nodeId) || [];
            if (node.data.type === 'condition') {
                // If condition is true, follow the True edge. If false, follow False edge. (simplified)
                // In a real system you might look at edge handles (targetHandle="true").
                if (result.data?.condition) {
                    await Promise.all(nextNodes.map(nId => executeNode(nId, visited)));
                } else {
                    // Could map "false" edges if needed, for now we just drop execution
                }
            } else {
                await Promise.all(nextNodes.map(nId => executeNode(nId, visited)));
            }
        }
    }

    try {
        await Promise.all(triggerNodes.map(t => executeNode(t.id)));
        const finalSuccess = Object.values(results).every(r => r.success);
        return { success: finalSuccess, results, outputs };
    } catch (e: any) {
        return { success: false, results, outputs, error: e.message };
    }
}

export async function executeWorkflowByIdOrName(idOrName: string, triggerInput: Record<string, any> = {}) {
    try {
        const wfResult = await db.select().from(workflows).where(
            or(
                eq(workflows.id, idOrName),
                eq(workflows.name, idOrName)
            )
        );

        const wf = wfResult[0];
        if (!wf || !wf.active) {
            return { success: false, error: "Workflow not found or inactive" };
        }

        return await executeWorkflow({
            nodes: wf.nodes as any,
            edges: wf.edges as any,
            triggerInput,
            workflowId: wf.id
        });
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

