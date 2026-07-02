import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Award, BookOpen, UserSquare2, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateProfile, API_BASE_URL, token } = useAuth();
  
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('1');
  const [sportCategory, setSportCategory] = useState('');
  const [achievements, setAchievements] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const profile = await res.json();
          setName(profile.name || '');
          setRollNo(profile.roll_no || '');
          setDept(profile.dept || '');
          setYear(String(profile.year) || '1');
          setSportCategory(profile.sport_category || '');
          setAchievements(profile.achievements || '');
          setImageUrl(profile.image_url || '');
        }
      } catch (err) {
        console.error('Error fetching fresh profile:', err);
      }
    };
    fetchProfile();
  }, [user, API_BASE_URL, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');
    setUpdating(true);

    try {
      await updateProfile({
        name,
        rollNo,
        dept,
        year: parseInt(year, 10),
        sportCategory,
        achievements,
        imageUrl: imageUrl || null
      });
      setSaveSuccess('Profile updated successfully!');
      setIsEditing(false);
      setUpdating(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile.');
      setUpdating(false);
    }
  };

  const depts = [
    'Computer Science & Engineering',
    'Electronics & Comm. Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology'
  ];

  const sports = ['Cricket', 'Basketball', 'Football', 'Badminton', 'Athletics', 'Volleyball', 'Table Tennis'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Player Profile</h1>
        <p className="text-slate-400 mt-1">Manage your academic details, sports credentials, and achievements.</p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-950/40 border border-emerald-900/40 rounded-xl text-sm text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-900/40 rounded-xl text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Summary & Picture */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/20 shadow-xl mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-emerald-600/10 text-emerald-400 flex items-center justify-center border-4 border-emerald-500/20 shadow-xl mb-4 font-bold text-4xl">
              {name.charAt(0)}
            </div>
          )}
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Roll No: {rollNo || 'Not Set'}</span>

          <div className="w-full border-t border-slate-800/80 my-5 pt-5 space-y-3.5 text-left text-sm">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium leading-none">Department</p>
                <p className="text-slate-300 mt-1 font-semibold">{dept || 'Not Specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserSquare2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium leading-none">Academic Year</p>
                <p className="text-slate-300 mt-1 font-semibold">{year ? `${year} Year` : 'Not Specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium leading-none">Primary Sport Category</p>
                <p className="text-slate-300 mt-1 font-semibold">{sportCategory || 'None'}</p>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Right Card: Details Form / Display */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-lg font-bold text-white mb-2">Edit Profile Credentials</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Roll Number</label>
                  <input 
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Department</label>
                  <select 
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                  >
                    <option value="">Select Department</option>
                    {depts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Academic Year</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Sport Category</label>
                  <select 
                    value={sportCategory}
                    onChange={(e) => setSportCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                  >
                    <option value="">Select Sport Category</option>
                    {sports.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Profile Image URL</label>
                  <input 
                    type="url"
                    value={imageUrl}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Achievements / Bio</label>
                <textarea 
                  rows="4"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Summarize your athletic and department achievements..."
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-100 outline-none transition-all duration-200"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Athletic Achievements
                </h3>
                <div className="mt-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl min-h-[120px]">
                  {achievements ? (
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{achievements}</p>
                  ) : (
                    <p className="text-sm text-slate-500 select-none">No achievements recorded yet. Click Edit Profile to add achievements!</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-6">
                <h3 className="text-lg font-bold text-white mb-3">System Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full uppercase">STUDENT</span>
                    <p className="text-sm font-bold text-white mt-2">Access Level: Standard Athlete</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Allowed to edit own profile, request registrations, view team rosters, and join tournament points tables.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
