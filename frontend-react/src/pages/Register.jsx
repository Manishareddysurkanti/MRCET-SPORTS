import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, IdentificationIcon, BookOpen, Calendar, Shield, AlertCircle } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('1');
  const [sportCategory, setSportCategory] = useState('');
  const [validationError, setValidationError] = useState('');

  const { register, user, loading } = useAuth();
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
    setValidationError('');

    if (!name || !email || !password) {
      setValidationError('Please enter name, email, and password.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role
    };

    if (role === 'STUDENT') {
      if (!rollNo || !dept || !sportCategory) {
        setValidationError('Students must provide roll number, department, and sports category.');
        return;
      }
      payload.rollNo = rollNo;
      payload.dept = dept;
      payload.year = parseInt(year, 10);
      payload.sportCategory = sportCategory;
    }

    try {
      const registeredUser = await register(payload);
      if (registeredUser.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setValidationError(err.message || 'Registration failed. Check if email/roll no already exists.');
    }
  };

  const sports = ['Cricket', 'Basketball', 'Football', 'Badminton', 'Athletics', 'Volleyball', 'Table Tennis'];
  const depts = [
    'Computer Science & Engineering',
    'Electronics & Comm. Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology'
  ];

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl glass p-8 rounded-2xl relative z-10 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-emerald-600 rounded-xl text-white shadow-lg shadow-indigo-500/20 mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">CREATE SPORTS ACCOUNT</h2>
          <p className="text-sm text-slate-400 mt-1">Register as a College Student Athlete or Admin</p>
        </div>

        {/* Errors */}
        {validationError && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-900/40 rounded-xl text-sm text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button 
            type="button"
            onClick={() => { setRole('STUDENT'); setValidationError(''); }}
            className={`py-2 px-4 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
              role === 'STUDENT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Athlete
          </button>
          <button 
            type="button"
            onClick={() => { setRole('ADMIN'); setValidationError(''); }}
            className={`py-2 px-4 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
              role === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Portal Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
                />
              </div>
            </div>

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
                  placeholder="john.doe@student.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
                />
              </div>
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
                placeholder="•••••••• (Min 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* Student Profile Section */}
          {role === 'STUDENT' && (
            <div className="border-t border-slate-800 pt-4 mt-2 space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-emerald-400">Student Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Roll Number</label>
                  <input 
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="CS23B1042"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Academic Year</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 transition-all duration-200 outline-none"
                  >
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Department</label>
                  <select 
                    required
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 transition-all duration-200 outline-none"
                  >
                    <option value="">Select Department</option>
                    {depts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Preferred Sport</label>
                  <select 
                    required
                    value={sportCategory}
                    onChange={(e) => setSportCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 transition-all duration-200 outline-none"
                  >
                    <option value="">Select Sport Category</option>
                    {sports.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-6 font-semibold rounded-xl text-white active:scale-[0.98] transition-all duration-200 flex items-center justify-center outline-none ${
              role === 'ADMIN' 
                ? 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800' 
                : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800'
            }`}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6 select-none">
          Already have an account?{' '}
          <Link to="/login" className={`font-semibold hover:underline ${role === 'ADMIN' ? 'text-indigo-400 hover:text-indigo-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
