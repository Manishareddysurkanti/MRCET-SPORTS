import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, API_BASE_URL, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Fetch notifications to count unread or show count
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const notifications = await res.json();
          // For demo, we just show total notifications as count
          setUnreadCount(notifications.length);
        }
      } catch (err) {
        console.error('Error fetching notification count:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user, API_BASE_URL, token]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="text-slate-400 hover:text-white md:hidden mr-4"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-white leading-tight">Welcome back, {user?.name.split(' ')[0]}</h2>
        <p className="text-xs text-slate-500 hidden sm:block">Manage and view sports events, matches, and analytics</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          isAdmin 
            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' 
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        }`}>
          {user?.role}
        </span>

        {/* Notifications Icon */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
          )}
        </button>

        {/* Profile Shortcut */}
        <div 
          onClick={() => !isAdmin && navigate('/profile')}
          className={`flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-all duration-200 ${isAdmin ? 'cursor-default hover:bg-transparent' : ''}`}
        >
          {user?.image_url ? (
            <img 
              src={user.image_url} 
              alt={user.name} 
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full ${isAdmin ? 'bg-indigo-600/30 text-indigo-400' : 'bg-emerald-600/30 text-emerald-400'} flex items-center justify-center font-bold text-sm border border-slate-700`}>
              {user?.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-slate-300 hidden md:block select-none">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
