import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Calendar,
  Coins,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import api from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('STATS'); // 'STATS' | 'USERS' | 'DISPUTES' | 'REPORTS'

  // Dispute resolution state
  const [resolvingId, setResolvingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, disputesRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=30'),
        api.get('/admin/disputes'),
        api.get('/admin/reports')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (disputesRes.data.success) setDisputes(disputesRes.data.disputes);
      if (reportsRes.data.success) setReports(reportsRes.data.reports);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleToggleSuspend = async (userId) => {
    if (!window.confirm('Toggle suspension status for this user?')) return;
    try {
      await api.patch(`/admin/users/${userId}/suspend`);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle suspension');
    }
  };

  const handleResolveDispute = async (disputeId, resolution) => {
    try {
      await api.patch(`/admin/disputes/${disputeId}/resolve`, {
        resolution,
        adminNotes: adminNotes || 'Admin arbitrated'
      });
      setResolvingId(null);
      setAdminNotes('');
      loadAdminData();
      alert(`Dispute resolved via ${resolution}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Dispute resolution failed');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin control console..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-amber-600" />
            <span>Platform Administration & Trust Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Community moderation, time-bank circulation metrics, and dispute arbitration.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          {[
            { id: 'STATS', label: 'Platform Stats' },
            { id: 'USERS', label: `Users (${stats?.totalUsers || 0})` },
            { id: 'DISPUTES', label: `Disputes (${disputes.length})` },
            { id: 'REPORTS', label: `Reports (${reports.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Platform Stats */}
      {activeTab === 'STATS' && (
        <div className="space-y-8">
          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-5 h-5 text-brand-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {stats?.activeUsers || 0} active members
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Exchanges</span>
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats?.totalSessions || 0}</p>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                {stats?.completedSessions || 0} completed successfully
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Circulating Credits</span>
                <Coins className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-600">{stats?.creditsExchanged || 0} Cr</p>
              <p className="text-xs text-slate-400 mt-1">Total teaching hours earned</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Trust Health</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.pendingDisputes || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Pending dispute reviews</p>
            </div>
          </div>

          {/* Popular Skills & Demanded Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Most Taught Skills (High Supply)</span>
              </h3>
              <div className="space-y-2">
                {stats?.mostTaughtSkills?.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {s.count} teachers
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Most Requested Skills (High Wishlist Demand)</span>
              </h3>
              <div className="space-y-2">
                {stats?.mostRequestedSkills?.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {s.count} learners wanting
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
          <form onSubmit={handleSearchUsers} className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Search
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-bold">User</th>
                  <th className="pb-3 font-bold">Location</th>
                  <th className="pb-3 font-bold">Credits</th>
                  <th className="pb-3 font-bold">Rating</th>
                  <th className="pb-3 font-bold">Sessions</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="py-3 text-slate-500">{u.location || 'India'}</td>
                    <td className="py-3 font-black text-emerald-600">
                      {u.totalCredits} Cr ({u.reservedCredits} held)
                    </td>
                    <td className="py-3 font-bold text-amber-600">{u.rating?.toFixed(1) || '5.0'} ★</td>
                    <td className="py-3 text-slate-700">{u.completedSessions || 0}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isSuspended
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleSuspend(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Disputes Arbitration */}
      {activeTab === 'DISPUTES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
          <h3 className="font-extrabold text-base text-slate-900">Disputed Sessions Mediation</h3>
          <p className="text-xs text-slate-500">
            Arbitrate contested sessions. Resolving triggers an immutable ledger transaction adjusting credits.
          </p>

          {disputes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No active session disputes. All exchanges are harmonious!
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((disp) => (
                <div key={disp._id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">
                        {disp.skill?.name || 'Skill Exchange'} ({disp.creditAmount} Cr)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Teacher: {disp.teacher?.name} • Learner: {disp.learner?.name}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      DISPUTED
                    </span>
                  </div>

                  <p className="text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <strong>Reported Reason:</strong> {disp.disputeReason || 'No dispute details provided'}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleResolveDispute(disp._id, 'REFUND_LEARNER')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Full Refund to Learner ({disp.creditAmount} Cr)
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp._id, 'PAY_TEACHER')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Release Credit to Teacher (+{disp.creditAmount} Cr)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Reports */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Trust & Safety Reports</h3>
          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No pending abuse or fake skill reports.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {rep.category}
                    </span>
                    <p className="text-slate-800 font-semibold mt-1">{rep.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Reporter: {rep.reporter?.name} • Reported: {rep.reportedUser?.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {rep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
