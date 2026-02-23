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
    ReactFlowProvider,
    useReactFlow,
    type Connection,
    type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Flash, Cpu, Routing2, Notification1, DocumentText, Save2, Magicpen } from 'iconsax-reactjs';

// ─── Node Types ──────────────────────────────────────────────────────────────
const NODE_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
    trigger: { bg: 'rgba(39,174,96,0.08)', border: '#27AE60', icon: <Flash size={14} color="#27AE60" />, label: 'Starting Event' },
    agent: { bg: 'rgba(128,5,50,0.08)', border: '#800532', icon: <Cpu size={14} color="#800532" />, label: 'AI Helper' },
    condition: { bg: 'rgba(230,126,22,0.08)', border: '#E67E22', icon: <Routing2 size={14} color="#E67E22" />, label: 'Check / Rule' },
    action: { bg: 'rgba(41,128,185,0.08)', border: '#2980B9', icon: <Notification1 size={14} color="#2980B9" />, label: 'Notification' },
    output: { bg: 'rgba(35,6,3,0.05)', border: 'rgba(35,6,3,0.4)', icon: <DocumentText size={14} color="#230603" />, label: 'Result' },
};

function FlowNode({ data, type: nodeType, selected }: { data: { label: string; description?: string }; type: string; selected?: boolean }) {
    const style = NODE_STYLES[nodeType] ?? NODE_STYLES.action;
    return (
        <div style={{
            backgroundColor: selected ? 'white' : style.bg,
            border: `1.5px solid ${selected ? '#230603' : style.border}`,
            borderRadius: 12,
            padding: '12px 16px',
            minWidth: 160,
            maxWidth: 200,
            boxShadow: selected ? '0 4px 16px rgba(0,0,0,0.1)' : '0 2px 12px rgba(35,6,3,0.06)',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'all 0.2s',
        }}>
            <Handle type="target" position={Position.Top} style={{ background: style.border, width: 8, height: 8, border: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {style.icon}
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(35,6,3,0.4)' }}>{style.label}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#230603', letterSpacing: '-0.2px', lineHeight: 1.3 }}>{data.label || 'Unnamed Node'}</div>
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

// ─── Builder Components ────────────────────────────────────────────────────────

function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, actionType?: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label, actionType }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid rgba(0,0,0,0.05)', paddingRight: 16 }}>
            <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', margin: '0 0 8px' }}>1. When this happens...</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'trigger', 'Automatic Schedule')} draggable style={{ border: '1px solid #27AE60', background: 'rgba(39,174,96,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Automatic Schedule</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'trigger', 'Student Event')} draggable style={{ border: '1px solid #27AE60', background: 'rgba(39,174,96,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Student Update (e.g. absent)</div>
                </div>
            </div>

            <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', margin: '0 0 8px' }}>2. Then do this...</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'action', 'Send Email', 'Send Email')} draggable style={{ border: '1px solid #2980B9', background: 'rgba(41,128,185,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Send Email to Parent</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'action', 'Send SMS', 'Send SMS')} draggable style={{ border: '1px solid #2980B9', background: 'rgba(41,128,185,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Send Resource via SMS</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'action', 'Add Student Note', 'Add Student Note')} draggable style={{ border: '1px solid #2980B9', background: 'rgba(41,128,185,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Record a Private Note</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'agent', 'Ask AI to Analyze', 'Ask AI to Analyze')} draggable style={{ border: '1px solid #800532', background: 'rgba(128,5,50,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Ask AI to Analyze Risk</div>
                </div>
            </div>

            <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', margin: '0 0 8px' }}>Extra Checks</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'condition', 'If / Else Filter')} draggable style={{ border: '1px solid #E67E22', background: 'rgba(230,126,22,0.08)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab' }}>Add a Rule (If / Then)</div>
                </div>
            </div>
        </div>
    );
}

function FlowCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    const [promptText, setPromptText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateWorkflow = async () => {
        if (!promptText.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });
            const data = await res.json();
            if (data.nodes && data.edges) {
                setNodes(data.nodes);
                setEdges(data.edges);
                setPromptText('');
            } else {
                alert("Failed to generate workflow. Error: " + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert("Error generating workflow.");
        } finally {
            setIsGenerating(false);
        }
    };

    const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr) return;
            const { type, label, actionType } = JSON.parse(dataStr);

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newNode: Node = {
                id: `node_${Date.now()}`,
                type,
                position,
                data: { label, config: actionType ? { actionType } : {} },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const updateNodeConfig = (key: string, value: string) => {
        if (!selectedNode) return;
        setNodes(nds => nds.map(n => {
            if (n.id === selectedNode.id) {
                const updatedNode = {
                    ...n,
                    data: { ...n.data, config: { ...(n.data.config as any), [key]: value } }
                };
                setSelectedNode(updatedNode); // keep local state in sync
                return updatedNode;
            }
            return n;
        }));
    };

    const updateNodeLabel = (label: string) => {
        if (!selectedNode) return;
        setNodes(nds => nds.map(n => {
            if (n.id === selectedNode.id) {
                const updatedNode = { ...n, data: { ...n.data, label } };
                setSelectedNode(updatedNode);
                return updatedNode;
            }
            return n;
        }));
    }


    const deleteSelectedNode = () => {
        if (!selectedNode) return;
        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
        setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
        setSelectedNode(null);
    }

    return (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 16 }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                {/* Magic Prompt Bar */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <Magicpen size={20} color="#800532" />
                    <input
                        value={promptText}
                        onChange={e => setPromptText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && generateWorkflow()}
                        placeholder="Describe your automation (e.g., 'Text me if a student drops below 80% attendance')"
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#230603', backgroundColor: 'transparent' }}
                        disabled={isGenerating}
                    />
                    <button
                        onClick={generateWorkflow}
                        disabled={isGenerating || !promptText.trim()}
                        style={{ padding: '8px 16px', backgroundColor: isGenerating || !promptText.trim() ? '#e0e0e0' : '#800532', color: isGenerating || !promptText.trim() ? '#666' : 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isGenerating || !promptText.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Workflow'}
                    </button>
                </div>

                {/* Canvas */}
                <div style={{ flex: 1, borderRadius: 14, border: '1px solid rgba(35,6,3,0.08)', overflow: 'hidden', backgroundColor: '#FAFAF8' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        style={{ backgroundColor: '#FAFAF8' }}
                        defaultEdgeOptions={{
                            style: { stroke: 'rgba(35,6,3,0.25)', strokeWidth: 1.5 },
                        }}
                    >
                        <Background color="rgba(35,6,3,0.06)" gap={20} size={1} />
                        <Controls style={{ boxShadow: 'none', border: '1px solid rgba(35,6,3,0.1)', borderRadius: 10 }} />
                    </ReactFlow>
                </div>
            </div>

            {/* Property Panel */}
            {selectedNode && (
                <div style={{ width: 280, flexShrink: 0, padding: 16, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 12, backgroundColor: '#FAFAF8', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 16, color: '#230603' }}>Properties</h3>
                        <button onClick={deleteSelectedNode} style={{ color: '#E74C3C', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Node Label</label>
                        <input
                            value={selectedNode.data.label as string}
                            onChange={e => updateNodeLabel(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />

                    {selectedNode.type === 'action' && (selectedNode.data.config as any)?.actionType === 'Send Email' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Recipient (To)</label>
                                <input
                                    placeholder="{{@trigger.studentEmail}}"
                                    value={(selectedNode.data.config as any)?.to || ''}
                                    onChange={e => updateNodeConfig('to', e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Subject</label>
                                <input
                                    placeholder="Attendance Alert for {{@trigger.studentName}}"
                                    value={(selectedNode.data.config as any)?.subject || ''}
                                    onChange={e => updateNodeConfig('subject', e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Body</label>
                                <textarea
                                    rows={4}
                                    placeholder="Hello {{@trigger.parentName}}, ..."
                                    value={(selectedNode.data.config as any)?.body || ''}
                                    onChange={e => updateNodeConfig('body', e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>
                        </>
                    )}

                    {selectedNode.type === 'action' && (selectedNode.data.config as any)?.actionType === 'Send SMS' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Phone Number</label>
                                <input
                                    placeholder="+1234567890"
                                    value={(selectedNode.data.config as any)?.to || ''}
                                    onChange={e => updateNodeConfig('to', e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Message Content</label>
                                <textarea
                                    rows={4}
                                    placeholder="Urgent notice regarding {{@trigger.studentName}}"
                                    value={(selectedNode.data.config as any)?.message || ''}
                                    onChange={e => updateNodeConfig('message', e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>
                        </>
                    )}

                    {selectedNode.type === 'condition' && (
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Condition Expression (JS)</label>
                            <input
                                placeholder="{{@node1.riskScore}} > 80"
                                value={(selectedNode.data.config as any)?.expression || ''}
                                onChange={e => updateNodeConfig('expression', e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'monospace' }}
                            />
                            <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4 }}>Returns true or false</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Page Wrapper ───────────────────────────────────────────────────────

export default function WorkflowsPage() {
    const saveWorkflow = async () => {
        // Implement save logic to /api/workflows
        console.log("Saving workflow...");
    };

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: 0, letterSpacing: '-0.8px' }}>Workflows Builder</h1>
                    <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: '4px 0 0' }}>Drag and drop nodes to build smart notifications</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#230603', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        Deactivated
                    </button>
                    <button
                        onClick={saveWorkflow}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        <Save2 size={16} color="white" /> Save Workflow
                    </button>
                </div>
            </div>

            <ReactFlowProvider>
                <FlowCanvas />
            </ReactFlowProvider>
        </div>
    );
}
