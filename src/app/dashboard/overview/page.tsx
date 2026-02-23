'use client';

import { useState, useEffect } from 'react';
import { People, Chart2, Warning2, DocumentText } from 'iconsax-reactjs';
import StatCard from '@/components/dashboard/StatCard';
import RiskBadge from '@/components/dashboard/RiskBadge';
import ArtifactsDrawer from '@/components/dashboard/ArtifactsDrawer';
import Link from 'next/link';
import OverviewLoading from './loading';
import { useGlobalContextStore } from '@/lib/contextStore';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

type Student = {
  id: string; name: string; grade: string; attendanceRate: number; gpa: number;
  assignmentCompletion: number; behaviorReferrals: number; lateSubmissions: number;
  lastRiskScore?: number | null; lastRiskCategory?: string | null;
};

export default function OverviewPage() {
  const router = useRouter();
  const setPendingPrompt = useGlobalContextStore(state => state.setPendingPrompt);
  const setViewContext = useGlobalContextStore(state => state.setViewContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(data => { setStudents(data); setLoading(false); });
  }, []);

  if (loading) return <OverviewLoading />;

  if (students.length === 0) return (
    <div style={{ textAlign: 'center' as const, padding: 64, fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(35,6,3,0.4)' }}>
      <p>No students yet. <Link href="/dashboard/students" style={{ color: '#800532' }}>Add students</Link> to see analytics.</p>
    </div>
  );

  const total = students.length;
  const critical = students.filter(s => s.lastRiskCategory === 'Critical').length;
  const atRisk = students.filter(s => s.lastRiskCategory === 'At Risk').length;
  const avgGpa = (students.reduce((a, s) => a + s.gpa, 0) / total).toFixed(1);
  const avgAttendance = Math.round(students.reduce((a, s) => a + s.attendanceRate, 0) / total);

  const riskDist = [
    { category: 'Critical', count: critical, fill: '#7C0D0D' },
    { category: 'At Risk', count: atRisk, fill: '#C0392B' },
    { category: 'Moderate', count: students.filter(s => s.lastRiskCategory === 'Moderate').length, fill: '#E67E22' },
    { category: 'Low', count: students.filter(s => s.lastRiskCategory === 'Low' || !s.lastRiskCategory).length, fill: '#27AE60' },
  ];

  const scatterData = students.map(s => ({
    attendance: s.attendanceRate, gpa: s.gpa, name: s.name,
    fill: s.lastRiskCategory === 'Critical' ? '#7C0D0D' : s.lastRiskCategory === 'At Risk' ? '#C0392B' : s.lastRiskCategory === 'Moderate' ? '#E67E22' : '#27AE60',
  }));

  const riskTrend = [...students]
    .filter(s => s.lastRiskScore != null)
    .sort((a, b) => (b.lastRiskScore ?? 0) - (a.lastRiskScore ?? 0))
    .slice(0, 8)
    .map(s => ({ name: s.name.split(' ')[0], risk: s.lastRiskScore! }));

  const atRiskStudents = students
    .filter(s => (s.lastRiskScore ?? 0) >= 60)
    .sort((a, b) => (b.lastRiskScore ?? 0) - (a.lastRiskScore ?? 0));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;
    return <div style={{ backgroundColor: 'white', border: '1px solid rgba(35,6,3,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>{payload.map((p, i) => <div key={i}><b>{p.name}</b>: {p.value}</div>)}</div>;
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: 0, letterSpacing: '-0.8px' }}>Overview</h1>
          <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: '4px 0 0' }}>Analytics across {total} students</p>
        </div>
        <ArtifactsDrawer />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Students" value={total} sub="in roster" IconComponent={People} />
        <StatCard label="At Risk / Critical" value={critical + atRisk} sub="need attention" IconComponent={Warning2} accentColor="#C0392B" trend={critical > 0 ? 'down' : 'flat'} trendLabel={critical > 0 ? `${critical} critical` : 'Stable'} />
        <StatCard label="Average GPA" value={avgGpa} sub="/ 4.0" IconComponent={DocumentText} accentColor="#2980B9" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} IconComponent={Chart2} accentColor="#27AE60" trend={avgAttendance < 80 ? 'down' : 'up'} trendLabel={avgAttendance < 80 ? 'Below 80%' : 'Healthy'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(35,6,3,0.06)" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: 'rgba(35,6,3,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(35,6,3,0.03)' }} />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} fill="#800532" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Highest Risk Scores</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskTrend} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(35,6,3,0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'rgba(35,6,3,0.55)' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(35,6,3,0.03)' }} />
              <Bar dataKey="risk" name="Risk Score" fill="#800532" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Attendance vs GPA</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(35,6,3,0.06)" />
            <XAxis type="number" dataKey="attendance" name="Attendance" domain={[40, 100]} unit="%" tick={{ fontSize: 11 }} label={{ value: 'Attendance %', position: 'insideBottom', offset: -8, fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} />
            <YAxis type="number" dataKey="gpa" name="GPA" domain={[0, 4.5]} tick={{ fontSize: 11 }} label={{ value: 'GPA', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} />
            <ZAxis range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return <div style={{ backgroundColor: 'white', border: '1px solid rgba(35,6,3,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'Inter' }}><b>{d.name}</b><br />Attendance: {d.attendance}%<br />GPA: {d.gpa}</div>;
            }} />
            <Scatter data={scatterData} fill="#800532" opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {atRiskStudents.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(192,57,43,0.15)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Students Needing Attention ({atRiskStudents.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {atRiskStudents.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(250,243,236,0.6)', border: '1px solid rgba(35,6,3,0.05)' }}>
                <div>
                  <Link href={`/dashboard/students/${s.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#230603', textDecoration: 'none' }}>{s.name}</Link>
                  <span style={{ fontSize: 12, color: 'rgba(35,6,3,0.4)', marginLeft: 10 }}>Grade {s.grade}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(35,6,3,0.45)' }}>Att: {s.attendanceRate}% · GPA: {s.gpa}</span>
                  <RiskBadge category={s.lastRiskCategory ?? 'Low'} score={s.lastRiskScore ?? undefined} />
                  <button 
                    onClick={() => {
                        setPendingPrompt(`Analyze the current risk factors for ${s.name} (Grade ${s.grade}). Their attendance is ${s.attendanceRate}% and GPA is ${s.gpa}. Fetch their full profile and suggest a targeted intervention plan.`);
                        setViewContext({ type: 'student_profile', studentId: s.id, studentName: s.name });
                        router.push('/dashboard');
                    }}
                    style={{ padding: '4px 12px', backgroundColor: 'rgba(128,5,50,0.08)', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#800532', fontFamily: 'inherit' }}
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
