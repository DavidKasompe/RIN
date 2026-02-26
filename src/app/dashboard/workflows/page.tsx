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
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Flash, Cpu, Routing2, Notification1, DocumentText, Save2, Magicpen } from 'iconsax-reactjs';

// ─── Node Types ──────────────────────────────────────────────────────────────
const NODE_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
    trigger: { bg: 'rgba(39,174,96,0.08)', border: '#27AE60', icon: <Flash size={14} color="#27AE60" />, label: 'Starting Event' },
    agent: { bg: 'rgba(128,5,50,0.08)', border: '#800532', icon: <Cpu size={14} color="#800532" />, label: 'AI Helper' },
    condition: { bg: 'rgba(230,126,22,0.08)', border: '#E67E22', icon: <Routing2 size={14} color="#E67E22" />, label: 'Check / Rule' },
    action: { bg: 'rgba(41,128,185,0.08)', border: '#2980B9', icon: <Notification1 size={14} color="#2980B9" />, label: 'Notification' },
    integration: { bg: 'rgba(142,68,173,0.08)', border: '#8E44AD', icon: <Flash size={14} color="#8E44AD" />, label: 'Integration' },
    output: { bg: 'rgba(35,6,3,0.05)', border: 'rgba(35,6,3,0.4)', icon: <DocumentText size={14} color="#230603" />, label: 'Result' },
};

const INTEGRATION_LOGOS: Record<string, string> = {
    'Slack Message': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'Gmail Send': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    'Calendar Event': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    'Notion Page': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    'Sheets Row': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg',
    'Drive Upload': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
};

function FlowNode({ data, type: nodeType, selected }: { data: { label: string; description?: string; config?: any }; type: string; selected?: boolean }) {
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
                {data.config?.actionType && INTEGRATION_LOGOS[data.config.actionType] ? (
                    <img src={INTEGRATION_LOGOS[data.config.actionType]} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />
                ) : style.icon}
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
    integration: FlowNode,
    output: FlowNode,
};

// ─── Builder Components ────────────────────────────────────────────────────────

function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, actionType?: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label, actionType }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-full lg:w-[240px] flex-shrink-0 flex flex-col gap-4 lg:border-r border-[rgba(0,0,0,0.05)] lg:pr-4 overflow-y-auto max-h-[300px] lg:max-h-full">
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

            <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', margin: '0 0 8px' }}>Integration Actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'integration', 'Slack Message', 'Slack Message')} draggable style={{ border: '1px solid rgba(142,68,173,0.3)', background: 'rgba(142,68,173,0.04)', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" width={16} height={16} /> Slack Message</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'integration', 'Gmail Send', 'Gmail Send')} draggable style={{ border: '1px solid rgba(142,68,173,0.3)', background: 'rgba(142,68,173,0.04)', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" width={16} height={16} /> Gmail Send</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'integration', 'Calendar Event', 'Calendar Event')} draggable style={{ border: '1px solid rgba(142,68,173,0.3)', background: 'rgba(142,68,173,0.04)', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Calendar" width={16} height={16} /> Calendar Event</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'integration', 'Notion Page', 'Notion Page')} draggable style={{ border: '1px solid rgba(142,68,173,0.3)', background: 'rgba(142,68,173,0.04)', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" width={16} height={16} style={{ objectFit: 'contain' }} /> Notion Page</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'integration', 'Sheets Row', 'Sheets Row')} draggable style={{ border: '1px solid rgba(142,68,173,0.3)', background: 'rgba(142,68,173,0.04)', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" alt="Sheets" width={16} height={16} /> Google Sheets Row</div>
                    <div className="dndnode" onDragStart={(e) => onDragStart(e, 'integration', 'Drive Upload', 'Drive Upload')} draggable style={{ border: '1px solid rgba(142,68,173,0.3)', background: 'rgba(142,68,173,0.04)', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" width={16} height={16} /> Google Drive Upload</div>
                </div>
            </div>
        </div>
    );
}

function FlowCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4">
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
                <div className="w-full lg:w-[280px] flex-shrink-0 p-4 border border-[rgba(0,0,0,0.05)] rounded-xl bg-[#FAFAF8] flex flex-col gap-4 overflow-y-auto max-h-[400px] lg:max-h-full">
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

                    {/* Integration config panels */}
                    {(selectedNode.type === 'integration') && (selectedNode.data.config as any)?.actionType === 'Slack Message' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Channel</label>
                                <input placeholder="#counselors or C0123ABC" value={(selectedNode.data.config as any)?.channel || ''} onChange={e => updateNodeConfig('channel', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Message</label>
                                <textarea rows={3} placeholder="⚠️ {{@trigger.studentName}} attendance dropped to {{@trigger.attendance}}%" value={(selectedNode.data.config as any)?.message || ''} onChange={e => updateNodeConfig('message', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
                            </div>
                        </>
                    )}

                    {(selectedNode.type === 'integration') && (selectedNode.data.config as any)?.actionType === 'Gmail Send' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>To</label>
                                <input placeholder="{{@trigger.parentEmail}}" value={(selectedNode.data.config as any)?.to || ''} onChange={e => updateNodeConfig('to', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Subject</label>
                                <input placeholder="Alert: {{@trigger.studentName}}" value={(selectedNode.data.config as any)?.subject || ''} onChange={e => updateNodeConfig('subject', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Body</label>
                                <textarea rows={3} placeholder="Dear {{@trigger.parentName}}, ..." value={(selectedNode.data.config as any)?.body || ''} onChange={e => updateNodeConfig('body', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
                            </div>
                        </>
                    )}

                    {(selectedNode.type === 'integration') && (selectedNode.data.config as any)?.actionType === 'Calendar Event' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Event Title</label>
                                <input placeholder="Meeting: {{@trigger.studentName}}" value={(selectedNode.data.config as any)?.title || ''} onChange={e => updateNodeConfig('title', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Attendees (emails, comma-separated)</label>
                                <input placeholder="{{@trigger.parentEmail}}" value={(selectedNode.data.config as any)?.attendees || ''} onChange={e => updateNodeConfig('attendees', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                        </>
                    )}

                    {(selectedNode.type === 'integration') && (selectedNode.data.config as any)?.actionType === 'Notion Page' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Page Title</label>
                                <input placeholder="Risk Report: {{@trigger.studentName}}" value={(selectedNode.data.config as any)?.pageTitle || ''} onChange={e => updateNodeConfig('pageTitle', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Content</label>
                                <textarea rows={3} placeholder="Student data and notes..." value={(selectedNode.data.config as any)?.content || ''} onChange={e => updateNodeConfig('content', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
                            </div>
                        </>
                    )}

                    {(selectedNode.type === 'integration') && (selectedNode.data.config as any)?.actionType === 'Sheets Row' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Spreadsheet ID</label>
                                <input placeholder="1BxiMVs0XRA..." value={(selectedNode.data.config as any)?.spreadsheetId || ''} onChange={e => updateNodeConfig('spreadsheetId', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Range (e.g., Sheet1!A:E)</label>
                                <input placeholder="Sheet1!A:E" value={(selectedNode.data.config as any)?.range || ''} onChange={e => updateNodeConfig('range', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Values (comma-separated)</label>
                                <input placeholder="{{@trigger.studentName}}, {{@trigger.riskScore}}, {{@trigger.date}}" value={(selectedNode.data.config as any)?.values || ''} onChange={e => updateNodeConfig('values', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                        </>
                    )}

                    {(selectedNode.type === 'integration') && (selectedNode.data.config as any)?.actionType === 'Drive Upload' && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>File Name</label>
                                <input placeholder="Report_{{@trigger.studentName}}.txt" value={(selectedNode.data.config as any)?.fileName || ''} onChange={e => updateNodeConfig('fileName', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(35,6,3)', opacity: 0.6, marginBottom: 4 }}>Folder (optional)</label>
                                <input placeholder="RIN Reports" value={(selectedNode.data.config as any)?.folder || ''} onChange={e => updateNodeConfig('folder', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                        </>
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
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 0, minHeight: '800px' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
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
