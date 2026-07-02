import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar for Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          ></div>
          
          {/* Sidebar Drawer */}
          <div className="relative z-50 h-full w-64 animate-slide-in">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
