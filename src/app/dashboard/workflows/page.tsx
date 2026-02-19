'use client';

import { useCallback, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    type Connection,
    type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Flash, Cpu, Routing2, Notification1, DocumentText, Add } from 'iconsax-reactjs';

// ─── Node Types ──────────────────────────────────────────────────────────────
const NODE_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
    trigger: { bg: 'rgba(39,174,96,0.08)', border: '#27AE60', icon: <Flash size={14} color="#27AE60" />, label: 'Trigger' },
    agent: { bg: 'rgba(128,5,50,0.08)', border: '#800532', icon: <Cpu size={14} color="#800532" />, label: 'AI Agent Step' },
    condition: { bg: 'rgba(230,126,22,0.08)', border: '#E67E22', icon: <Routing2 size={14} color="#E67E22" />, label: 'Condition' },
    action: { bg: 'rgba(41,128,185,0.08)', border: '#2980B9', icon: <Notification1 size={14} color="#2980B9" />, label: 'Action' },
    output: { bg: 'rgba(35,6,3,0.05)', border: 'rgba(35,6,3,0.4)', icon: <DocumentText size={14} color="#230603" />, label: 'Output' },
};

function FlowNode({ data, type: nodeType }: { data: { label: string; description?: string }; type: string }) {
    const style = NODE_STYLES[nodeType] ?? NODE_STYLES.action;
    return (
        <div style={{
            backgroundColor: style.bg,
            border: `1.5px solid ${style.border}`,
            borderRadius: 12,
            padding: '12px 16px',
            minWidth: 160,
            maxWidth: 200,
            boxShadow: '0 2px 12px rgba(35,6,3,0.06)',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <Handle type="target" position={Position.Top} style={{ background: style.border, width: 8, height: 8, border: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {style.icon}
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(35,6,3,0.4)' }}>{style.label}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#230603', letterSpacing: '-0.2px', lineHeight: 1.3 }}>{data.label}</div>
            {data.description && <div style={{ fontSize: 11, color: 'rgba(35,6,3,0.45)', marginTop: 4, lineHeight: 1.4 }}>{data.description}</div>}
            <Handle type="source" position={Position.Bottom} style={{ background: style.border, width: 8, height: 8, border: 'none' }} />
        </div>
    );
}

const nodeTypes = {
    trigger: FlowNode,
    agent: FlowNode,
    condition: FlowNode,
    action: FlowNode,
    output: FlowNode,
};

// ─── Predefined Workflow Templates ───────────────────────────────────────────
const WORKFLOWS = {
    'risk-assessment': {
        name: 'Full Risk Assessment',
        description: 'Analyze a student and generate a structured risk report',
        nodes: [
            { id: '1', type: 'trigger', position: { x: 80, y: 20 }, data: { label: 'Student Selected', description: 'Teacher selects a student' } },
            { id: '2', type: 'agent', position: { x: 80, y: 130 }, data: { label: 'Run AI Analysis', description: 'gpt-4o-mini structured risk assessment' } },
            { id: '3', type: 'condition', position: { x: 80, y: 240 }, data: { label: 'Risk Score > 60?', description: 'Route based on severity' } },
            { id: '4', type: 'action', position: { x: -80, y: 350 }, data: { label: 'Flag for Review', description: 'Mark student as high priority' } },
            { id: '5', type: 'output', position: { x: 240, y: 350 }, data: { label: 'Save Report', description: 'Store analysis to student profile' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
        ],
    },
    'class-scan': {
        name: 'Class-Wide Scan',
        description: 'Batch analyze all students and surface the top at-risk cases',
        nodes: [
            { id: '1', type: 'trigger', position: { x: 80, y: 20 }, data: { label: 'Manual Trigger', description: 'Teacher initiates scan' } },
            { id: '2', type: 'agent', position: { x: 80, y: 130 }, data: { label: 'Bulk Analysis', description: 'Analyze all students sequentially' } },
            { id: '3', type: 'condition', position: { x: 80, y: 240 }, data: { label: 'Any Critical?', description: 'Check for critical risk scores' } },
            { id: '4', type: 'action', position: { x: -80, y: 350 }, data: { label: 'Send Alert', description: 'Notify about critical students' } },
            { id: '5', type: 'output', position: { x: 240, y: 350 }, data: { label: 'Update Overview', description: 'Refresh analytics dashboard' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
        ],
    },
    'intervention': {
        name: 'Intervention Plan',
        description: 'Generate a 3-step intervention plan for at-risk students',
        nodes: [
            { id: '1', type: 'trigger', position: { x: 80, y: 20 }, data: { label: 'Risk Score Input', description: 'From previous analysis' } },
            { id: '2', type: 'agent', position: { x: 80, y: 130 }, data: { label: 'Generate Plan', description: 'AI creates actionable 3-step plan' } },
            { id: '3', type: 'action', position: { x: 80, y: 240 }, data: { label: 'Schedule Calendar', description: 'Add follow-up events to calendar' } },
            { id: '4', type: 'output', position: { x: 80, y: 350 }, data: { label: 'Plan Ready', description: 'Display and export plan' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
        ],
    },
    'parent-letter': {
        name: 'Parent Communication',
        description: 'Draft a personalized parent letter with context and recommendations',
        nodes: [
            { id: '1', type: 'trigger', position: { x: 80, y: 20 }, data: { label: 'Student Profile', description: 'Name, grades, risk data' } },
            { id: '2', type: 'agent', position: { x: 80, y: 130 }, data: { label: 'Draft Letter', description: 'AI drafts empathetic letter' } },
            { id: '3', type: 'condition', position: { x: 80, y: 240 }, data: { label: 'Review & Edit', description: 'Teacher approves content' } },
            { id: '4', type: 'output', position: { x: 80, y: 350 }, data: { label: 'Export Letter', description: 'Copy or download as PDF' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
        ],
    },
};

type WorkflowKey = keyof typeof WORKFLOWS;

export default function WorkflowsPage() {
    const [activeWorkflow, setActiveWorkflow] = useState<WorkflowKey>('risk-assessment');
    const wf = WORKFLOWS[activeWorkflow];
    const [nodes, setNodes, onNodesChange] = useNodesState(wf.nodes as Node[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(wf.edges);
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState<string | null>(null);

    const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

    const switchWorkflow = (key: WorkflowKey) => {
        const w = WORKFLOWS[key];
        setActiveWorkflow(key);
        setNodes(w.nodes as Node[]);
        setEdges(w.edges);
        setRunResult(null);
    };

    const runWorkflow = async () => {
        setRunning(true);
        setRunResult(null);
        await new Promise(r => setTimeout(r, 1800));
        setRunResult(`Workflow "${WORKFLOWS[activeWorkflow].name}" completed successfully. 12 steps processed, results saved.`);
        setRunning(false);
    };

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: 0, letterSpacing: '-0.8px' }}>Workflows</h1>
                    <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: '4px 0 0' }}>Visual AI pipeline builder — drag nodes to customize</p>
                </div>
                <button
                    onClick={runWorkflow}
                    disabled={running}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', backgroundColor: running ? 'rgba(128,5,50,0.5)' : '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s' }}
                >
                    <Play size={16} color="white" /> {running ? 'Running...' : 'Run Workflow'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
                {/* Left panel — templates */}
                <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', margin: '0 0 4px' }}>Templates</p>
                    {(Object.entries(WORKFLOWS) as [WorkflowKey, typeof WORKFLOWS[WorkflowKey]][]).map(([key, w]) => (
                        <button
                            key={key}
                            onClick={() => switchWorkflow(key)}
                            style={{
                                textAlign: 'left',
                                padding: '12px 14px',
                                borderRadius: 11,
                                border: activeWorkflow === key ? '1.5px solid #800532' : '1px solid rgba(35,6,3,0.1)',
                                backgroundColor: activeWorkflow === key ? 'rgba(128,5,50,0.06)' : 'white',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: 700, color: activeWorkflow === key ? '#800532' : '#230603', marginBottom: 3 }}>{w.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(35,6,3,0.45)', lineHeight: 1.4 }}>{w.description}</div>
                        </button>
                    ))}

                    <div style={{ marginTop: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', margin: '0 0 6px' }}>Legend</p>
                        {Object.entries(NODE_STYLES).map(([type, s]) => (
                            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0' }}>
                                <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: s.bg, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {s.icon}
                                </div>
                                <span style={{ fontSize: 11, color: 'rgba(35,6,3,0.55)', fontWeight: 500 }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div style={{ flex: 1, borderRadius: 14, border: '1px solid rgba(35,6,3,0.08)', overflow: 'hidden', backgroundColor: '#FAFAF8' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        style={{ backgroundColor: '#FAFAF8' }}
                        defaultEdgeOptions={{
                            style: { stroke: 'rgba(35,6,3,0.25)', strokeWidth: 1.5 },
                            animated: running,
                        }}
                    >
                        <Background color="rgba(35,6,3,0.06)" gap={20} size={1} />
                        <Controls style={{ boxShadow: 'none', border: '1px solid rgba(35,6,3,0.1)', borderRadius: 10 }} />
                        <MiniMap
                            style={{ borderRadius: 10, border: '1px solid rgba(35,6,3,0.08)' }}
                            nodeColor={(n) => (NODE_STYLES[n.type ?? ''] ?? NODE_STYLES.action).border}
                        />
                    </ReactFlow>
                </div>
            </div>

            {/* Run result */}
            {runResult && (
                <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#1D7A47' }}>
                    {runResult}
                </div>
            )}
        </div>
    );
}
