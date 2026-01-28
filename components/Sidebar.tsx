
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'nodes', label: 'GPU Nodes', icon: '🖥️' },
    { id: 'provision', label: 'Provisioning', icon: '🚀' },
    { id: 'allocate', label: 'Allocations', icon: '📎' },
    { id: 'health', label: 'Cluster Health', icon: '🏥' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          GPU Manager
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Control Plane</p>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center p-3 rounded-lg bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
            JD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Cluster Admin</p>
            <p className="text-xs text-slate-500">v1.0.0-mcp</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
