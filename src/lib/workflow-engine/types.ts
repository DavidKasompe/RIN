export interface WorkflowNode {
    id: string;
    type: string; // 'trigger' | 'agent' | 'condition' | 'action' | 'output'
    position?: { x: number; y: number };
    data: {
        label?: string;
        description?: string;
        config?: Record<string, any>;
        type: string; // duplicate useful for react flow
        enabled?: boolean;
    };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

export interface StepContext {
    executionId?: string;
    nodeId: string;
    nodeName: string;
    nodeType: string;
}

export interface ExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
}

export type StepFunction = (input: Record<string, any>) => Promise<ExecutionResult>;

export interface StepImporter {
    importer: () => Promise<any>;
    stepFunction: string;
}
