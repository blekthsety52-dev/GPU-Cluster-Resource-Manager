
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { ClusterHealthReport, GpuNode, Alert } from '../types';

interface DashboardProps {
  health: ClusterHealthReport;
  nodes: GpuNode[];
  alerts: Alert[];
}

const Dashboard: React.FC<DashboardProps> = ({ health, nodes, alerts }) => {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  
  const statusData = [
    { name: 'Ready', value: health.available_nodes },
    { name: 'Degraded', value: nodes.filter(n => n.status === 'draining').length },
    { name: 'Offline', value: nodes.filter(n => n.status === 'offline' || n.status === 'maintenance').length },
  ];

  const utilizationHistory = [
    { time: '00:00', util: 65 },
    { time: '04:00', util: 58 },
    { time: '08:00', util: 82 },
    { time: '12:00', util: 94 },
    { time: '16:00', util: 78 },
    { time: '20:00', util: 72 },
    { time: '23:59', util: 68 },
  ];

  const StatCard = ({ label, value, subtext, icon, color }: any) => (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-slate-500 mt-2">{subtext}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-400 text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Cluster Overview</h2>
          <p className="text-slate-400">Real-time aggregate resource metrics</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-full border ${
          health.status === 'healthy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          health.status === 'degraded' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
          'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
          <span className="text-sm font-semibold capitalize">{health.status} Status</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Nodes" value={health.total_nodes} subtext="Instances provisioned" icon="🖥️" color="blue" />
        <StatCard label="GPU Count" value={health.total_gpus} subtext={`${health.available_gpus} available`} icon="🔥" color="indigo" />
        <StatCard label="Utilization" value={`${health.utilization_percentage}%`} subtext="Memory & compute avg" icon="📈" color="emerald" />
        <StatCard label="Active Alerts" value={alerts.length} subtext="Critical & warnings" icon="⚠️" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-200">Aggregate GPU Utilization (24h)</h3>
            <select className="bg-slate-900 border border-slate-700 rounded-md text-sm px-2 py-1 outline-none">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationHistory}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="util" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Distribution */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-200 mb-6">Recent Events</h3>
          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`p-4 rounded-lg border flex items-start space-x-3 ${
                alert.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20' :
                alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-slate-700/30 border-slate-700/50'
              }`}>
                <span className="text-xl">
                  {alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟠' : '🔵'}
                </span>
                <div>
                  <div className="flex justify-between w-full">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-tight">{alert.component}</p>
                    <p className="text-[10px] text-slate-500">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="text-sm text-slate-200 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors">
            View All Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
