import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Trophy, 
  Calendar, 
  Users, 
  UserCircle, 
  Bell, 
  ClipboardCheck, 
  ListOrdered,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const activeClass = `flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
    isAdmin 
      ? 'bg-indigo-600/30 text-indigo-400 border-l-4 border-indigo-500 pl-3' 
      : 'bg-emerald-600/30 text-emerald-400 border-l-4 border-emerald-500 pl-3'
  }`;

  const inactiveClass = 'flex items-center px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all duration-200 pl-4';

  const adminLinks = [
    { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/matches', label: 'Matches & Scores', icon: Calendar },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/admin-registrations', label: 'Registrations', icon: ClipboardCheck },
    { to: '/notifications', label: 'Announcements', icon: Bell },
  ];

  const studentLinks = [
    { to: '/student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/matches', label: 'Matches', icon: Calendar },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/leaderboard', label: 'Leaderboard', icon: ListOrdered },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-2 rounded-lg ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'} text-white`}>
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white leading-none">MRCET SPORTS</h1>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              {isAdmin ? 'Admin Portal' : 'Student Portal'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="truncate pr-2">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-lg text-sm text-slate-300 font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
