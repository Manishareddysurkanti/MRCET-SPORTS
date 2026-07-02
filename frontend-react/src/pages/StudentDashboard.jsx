import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { token, API_BASE_URL } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Fetch student registrations
        const regRes = await fetch(`${API_BASE_URL}/tournaments/my-registrations`, { headers });
        const regData = regRes.ok ? await regRes.json() : [];
        setRegistrations(regData);

        // 2. Fetch live matches
        const matchesRes = await fetch(`${API_BASE_URL}/matches/live`, { headers });
        const matchesData = matchesRes.ok ? await matchesRes.json() : [];
        setLiveMatches(matchesData);

        // 3. Fetch announcements
        const notifRes = await fetch(`${API_BASE_URL}/notifications`, { headers });
        const notifData = notifRes.ok ? await notifRes.json() : [];
        setNotifications(notifData.slice(0, 4)); // Show recent 4

        setLoading(false);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        setError('Failed to fetch dashboard data. Please check connection.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const approvedRegistrationsCount = registrations.filter(r => r.status === 'Approved').length;
  const pendingRegistrationsCount = registrations.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Athlete Dashboard</h1>
        <p className="text-slate-400 mt-1">Track your tournaments, view live matches, and receive official updates.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-900/40 rounded-xl text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/10">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Approved Tournaments</p>
              <h3 className="text-2xl font-bold text-white mt-1">{approvedRegistrationsCount}</h3>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-600/20 text-yellow-400 border border-yellow-500/10">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-white mt-1">{pendingRegistrationsCount}</h3>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/10">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Recent Announcements</p>
              <h3 className="text-2xl font-bold text-white mt-1">{notifications.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Matches & Tournaments) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Score Tracker */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                Live Matches
              </h2>
              <Link to="/matches?status=Live" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                View All
              </Link>
            </div>

            {liveMatches.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
                <p className="text-sm text-slate-500 select-none">No matches are live right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveMatches.map((match) => (
                  <div key={match.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-left shrink-0">
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">LIVE</span>
                      <p className="text-xs text-slate-500 mt-1">{match.tournament_name}</p>
                    </div>
                    {/* Scoreboard */}
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-semibold text-slate-300">{match.team1_name}</span>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-lg font-extrabold text-white">{match.score_team1}</span>
                        <span className="text-xs text-slate-600">-</span>
                        <span className="text-lg font-extrabold text-white">{match.score_team2}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-300">{match.team2_name}</span>
                    </div>
                    {/* Venue / Time */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-slate-400">Match #{match.id}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{match.match_time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament Registrations */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                Tournament Registrations
              </h2>
              <Link to="/tournaments" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                Register for More
              </Link>
            </div>

            {registrations.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
                <p className="text-sm text-slate-500 select-none">You haven't registered for any tournaments yet.</p>
                <Link to="/tournaments" className="mt-3 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-2">Tournament</th>
                      <th className="py-3 px-2">Sport</th>
                      <th className="py-3 px-2">Registration Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-900/20">
                        <td className="py-4 px-2 font-medium text-white">{reg.tournament_name}</td>
                        <td className="py-4 px-2 text-slate-400">{reg.sport_type}</td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            reg.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : reg.status === 'Rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {reg.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                            {reg.status === 'Pending' && <Clock className="w-3 h-3" />}
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <Link to="/tournaments" className="text-xs font-semibold text-slate-400 hover:text-white">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Announcements & Sport Category Details) */}
        <div className="space-y-6">
          {/* Announcements Board */}
          <div className="glass p-6 rounded-2xl flex flex-col h-full">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Announcements
            </h2>

            {notifications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
                <p className="text-sm text-slate-500 select-none">No active announcements.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all duration-200">
                    <h4 className="text-sm font-semibold text-white truncate">{notif.title}</h4>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-600 block mt-2">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
