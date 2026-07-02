import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass p-8 rounded-2xl relative z-10 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-emerald-600 rounded-xl text-white shadow-lg shadow-indigo-500/20 mb-3">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">MRCET SPORTS PORTAL</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to your college athlete dashboard</p>
        </div>

        {/* Errors */}
        {loginError && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-900/40 rounded-xl text-sm text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@sports.college.edu"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:from-indigo-800 disabled:to-emerald-800 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center outline-none"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6 select-none">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
            Register Profile
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
