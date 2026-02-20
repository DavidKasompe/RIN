"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Setting2, User, Export, Trash, InfoCircle, Link2, Copy, EmptyWallet, Crown, TickCircle } from 'iconsax-reactjs';
import { useCustomer, CheckoutDialog } from 'autumn-js/react';
import { getTeamDetailsAction } from '../../api/school/team';
import { Loader2 } from 'lucide-react';
import { useSession, authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';

interface Profile {
  name: string;
  school: string; // Used locally for display before full sync
  role: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SchoolData {
  name: string;
  inviteCode: string;
  createdAt?: string;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '16px 24px', borderBottom: '0.67px solid rgb(228,221,205)', display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', letterSpacing: '-0.3px' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, hint, last, children }: { label: string; hint?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start', paddingBottom: last ? 0 : 16, marginBottom: last ? 0 : 16, borderBottom: last ? 'none' : '0.67px solid rgb(246,240,228)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgb(26,25,25)', marginBottom: 2 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'rgb(114,106,90)', lineHeight: 1.4, marginTop: 4 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 9,
  border: '0.67px solid rgb(228,221,205)',
  fontSize: 14,
  fontFamily: "'Inter', system-ui, sans-serif",
  outline: 'none',
  backgroundColor: 'white',
  color: 'rgb(26,25,25)',
  boxSizing: 'border-box' as const,
};

function BillingContent({ schoolData }: { schoolData: SchoolData | null }) {
  const { customer, checkout, openBillingPortal } = useCustomer();
  const [loading, setLoading] = useState(false);

  if (!customer) {
    return <div style={{ color: 'rgb(114,106,90)', fontSize: 14 }}>Loading billing details...</div>;
  }

  const proProduct = customer.products?.find((p: any) => p.id === 'pro');

  let planName = 'Free / Not Subscribed';
  let statusText = 'No Active Plan';
  let banner = null;
  let isTrial = false;
  let isActive = false;
  let isExpired = false;

  if (proProduct) {
    isTrial = proProduct.status === 'trialing';
    isActive = proProduct.status === 'active';
    isExpired = !isTrial && !isActive;
    planName = proProduct.name || 'School Team';
    statusText = isTrial ? 'Trialing' : isActive ? 'Active' : 'Expired';
  } else if (schoolData?.createdAt) {
    const createdDate = new Date(schoolData.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = 7 - daysSinceCreation;

    if (daysLeft > 0) {
      isTrial = true;
      planName = 'School Team';
      statusText = `${daysLeft} days left on free trial`;
      banner = (
        <div style={{ padding: '14px 16px', backgroundColor: 'rgba(128,5,50,0.04)', borderRadius: 12, border: '1px solid rgba(128,5,50,0.1)', color: '#800532', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
          <InfoCircle size={20} variant="Bulk" color="#800532" />
          You are currently on a 7-day free trial. Upgrade to ensure uninterrupted access.
        </div>
      );
    } else {
      isExpired = true;
      planName = 'School Team';
      statusText = 'Free trial expired';
      banner = (
        <div style={{ padding: '14px 16px', backgroundColor: 'rgba(192,57,43,0.06)', borderRadius: 12, border: '1px solid rgba(192,57,43,0.15)', color: '#C0392B', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
          <InfoCircle size={20} variant="Bulk" color="#C0392B" />
          Your 7-day free trial has expired. Please upgrade to continue using RIN.
        </div>
      );
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {banner}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: 'white', borderRadius: 12, border: '1px solid rgb(228,221,205)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.3px' }}>{planName}</h3>
            <div style={{ padding: '4px 10px', backgroundColor: isTrial || isActive ? 'rgba(46,125,50,0.1)' : 'rgba(192,57,43,0.1)', color: isTrial || isActive ? '#2E7D32' : '#C0392B', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
              {statusText}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5, maxWidth: 400 }}>
            Access to AI assessments, intervention planning, early warning systems, and premium features.
          </p>
        </div>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              if (isActive || isTrial) {
                // If they already have a product attached, redirect to manage it
                await openBillingPortal();
              } else {
                // Otherwise attach / checkout
                await checkout({
                  productId: 'pro',
                  dialog: CheckoutDialog,
                  successUrl: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?success=true` : undefined
                });
              }
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: isActive || isTrial ? 'white' : '#800532', border: isActive || isTrial ? '1px solid rgb(228,221,205)' : 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: isActive || isTrial ? 'rgb(26,25,25)' : 'white', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} variant="Bulk" />}
          {loading ? 'Redirecting...' : isActive || isTrial ? 'Manage Billing' : 'Upgrade Plan'}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'integrations' | 'billing'>('profile');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setActiveTab('billing');
      setShowSuccessModal(true);
      // Clean up the URL
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  const { data: session } = useSession();

  // Profile State
  const [profile, setProfile] = useState<Profile>({ name: '', school: '', role: 'educator' });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Team State
  const [teamLoading, setTeamLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Populate profile form when session loads
    if (session?.user) {
      setProfile({
        name: session.user.name || '',
        school: '',
        role: (session.user as any).role || 'educator',
      });
    }

    // Fetch team data from server
    async function fetchTeam() {
      const res = await getTeamDetailsAction();
      if (res.success && res.school) {
        setSchoolData(res.school);
        setMembers(res.members || []);
      }
      setTeamLoading(false);
    }
    fetchTeam();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await authClient.updateUser({
      name: profile.name,
      // @ts-ignore
      role: profile.role
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const copyInvite = () => {
    if (schoolData?.inviteCode) {
      navigator.clipboard.writeText(schoolData.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportData = () => {
    const data = { profile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rin-export.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 760, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.8px' }}>Settings</h1>
        <p style={{ fontSize: 15, color: 'rgb(114,106,90)', margin: '6px 0 0' }}>Manage your workspace, profile, and team members</p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid rgb(228,221,205)', marginBottom: 32 }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{ padding: '0 0 12px 0', border: 'none', background: 'transparent', fontSize: 15, fontWeight: activeTab === 'profile' ? 700 : 500, color: activeTab === 'profile' ? '#800532' : 'rgb(114,106,90)', borderBottom: activeTab === 'profile' ? '2px solid #800532' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('team')}
          style={{ padding: '0 0 12px 0', border: 'none', background: 'transparent', fontSize: 15, fontWeight: activeTab === 'team' ? 700 : 500, color: activeTab === 'team' ? '#800532' : 'rgb(114,106,90)', borderBottom: activeTab === 'team' ? '2px solid #800532' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
          School Team
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          style={{ padding: '0 0 12px 0', border: 'none', background: 'transparent', fontSize: 15, fontWeight: activeTab === 'integrations' ? 700 : 500, color: activeTab === 'integrations' ? '#800532' : 'rgb(114,106,90)', borderBottom: activeTab === 'integrations' ? '2px solid #800532' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
          Integrations
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          style={{ padding: '0 0 12px 0', border: 'none', background: 'transparent', fontSize: 15, fontWeight: activeTab === 'billing' ? 700 : 500, color: activeTab === 'billing' ? '#800532' : 'rgb(114,106,90)', borderBottom: activeTab === 'billing' ? '2px solid #800532' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
          Billing
        </button>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(4px)' }} onClick={() => setShowSuccessModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', borderRadius: 24, padding: 32, width: '90%', maxWidth: 440, zIndex: 999, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(46,125,50,0.1)', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <TickCircle size={32} variant="Bulk" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'rgb(26,25,25)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Subscription Upgraded!</h2>
            <p style={{ fontSize: 15, color: 'rgb(114,106,90)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Thank you for upgrading to the School Team plan. Your account has been successfully updated with full access to all premium features.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{ width: '100%', padding: '14px', backgroundColor: '#800532', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Continue to Dashboard
            </button>
          </div>
        </>
      )}

      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-300">
          <Section title="Personal Info" icon={<User size={18} color="#27AE60" variant="Bulk" />}>
            <FieldRow label="Full Name">
              <input value={profile.name} onChange={e => setProfile(s => ({ ...s, name: e.target.value }))} placeholder="Your name" style={inputStyle} />
            </FieldRow>
            <FieldRow label="Role" last>
              <select value={profile.role} onChange={e => setProfile(s => ({ ...s, role: e.target.value }))} style={inputStyle}>
                <option value="educator">Educator / Teacher</option>
                <option value="counselor">School Counselor</option>
                <option value="administrator">Administrator</option>
                <option value="advisor">Student Advisor</option>
              </select>
            </FieldRow>
          </Section>

          <Section title="Data Management" icon={<Export size={18} color="#E67E22" variant="Bulk" />}>
            <FieldRow label="Export Profile" hint="Download a JSON backup of your settings" last>
              <button onClick={exportData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: 'rgba(230,126,22,0.08)', border: '1px solid rgba(230,126,22,0.2)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#C87A0A', cursor: 'pointer' }}>
                <Export size={16} color="#C87A0A" /> Export JSON
              </button>
            </FieldRow>
          </Section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button disabled={saving} onClick={saveProfile} style={{ padding: '12px 32px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 0.2s', opacity: saved || saving ? 0.9 : 1 }}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="animate-in fade-in duration-300">
          <Section title="School Details" icon={<InfoCircle size={18} color="#800532" variant="Bulk" />}>
            {teamLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, color: 'rgb(114,106,90)' }}>
                <Loader2 size={16} className="animate-spin" /> Loading school data...
              </div>
            ) : schoolData ? (
              <>
                <FieldRow label="School Name">
                  <div style={{ padding: '10px 12px', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, color: '#230603', fontWeight: 500 }}>
                    {schoolData.name}
                  </div>
                </FieldRow>
                <FieldRow label="Invite Code" hint="Share this code with your colleagues so they can join this school." last>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ padding: '10px 16px', backgroundColor: 'rgba(128,5,50,0.05)', borderRadius: 8, border: '1px solid rgba(128,5,50,0.2)', fontSize: 16, fontWeight: 700, color: '#800532', letterSpacing: '1px' }}>
                      {schoolData.inviteCode}
                    </div>
                    <button onClick={copyInvite} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {copied ? 'Copied!' : <><Copy size={16} /> Copy Code</>}
                    </button>
                  </div>
                </FieldRow>
              </>
            ) : (
              <div style={{ padding: 16, backgroundColor: 'rgba(192,57,43,0.05)', color: '#C0392B', borderRadius: 8, fontSize: 14 }}>
                You are not currently attached to a school team.
              </div>
            )}
          </Section>

          {schoolData && (
            <Section title={`Team Members (${members.length})`} icon={<User size={18} color="#2980B9" variant="Bulk" />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {members.map((member, i) => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i === members.length - 1 ? 'none' : '1px solid rgb(246,240,228)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#230603', marginBottom: 2 }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: 'rgb(114,106,90)' }}>{member.email}</div>
                    </div>
                    <div style={{ padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#230603', textTransform: 'capitalize' }}>
                      {member.role || 'Educator'}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="animate-in fade-in duration-300">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>

            {/* Google Classroom */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="https://www.gstatic.com/classroom/logo_square_rounded.svg" width={40} height={40} style={{ borderRadius: 8 }} alt="Classroom" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Google Classroom</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Assignments & Roster</p>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                Sync class schedules, assignments, and allow users to sign in with their Google accounts.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Link2 size={16} /> Connect Account
                </button>
              </div>
            </div>

            {/* PowerSchool SIS */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'white', border: '1px solid rgb(228,221,205)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="https://www.powerschool.com/wp-content/themes/powerschool/img/logo-cyan-p.svg" alt="PowerSchool" style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>PowerSchool SIS</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Attendance & Demographics</p>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                Import student demographics, attendance records, and disciplinary history automatically.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Link2 size={16} /> Connect Account
                </button>
              </div>
            </div>

            {/* Moodle LMS */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(235,112,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon="devicon:moodle" width="24" height="24" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Moodle LMS</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Courses & Grades</p>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                Sync student rosters, course assignments, and grades directly into RIN.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Link2 size={16} /> Connect Account
                </button>
              </div>
            </div>

            {/* Google Calendar */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(66,133,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon="logos:google-calendar" width="24" height="24" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Google Calendar</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Events & Meetings</p>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                Sync intervention meetings, parent-teacher conferences, and academic events.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Link2 size={16} /> Connect Account
                </button>
              </div>
            </div>

            {/* Notion Base */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(35,6,3,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon="ri:notion-fill" width="24" height="24" color="#230603" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Notion Base</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Documents & Workflows</p>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                Export reports, risk profiles, and intervention structures directly to Notion workspace.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Link2 size={16} /> Connect Account
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="animate-in fade-in duration-300">
          <Section title="Subscription & Billing" icon={<EmptyWallet size={18} color="#800532" variant="Bulk" />}>
            <BillingContent schoolData={schoolData} />
          </Section>
        </div>
      )}

    </div>
  );
}
