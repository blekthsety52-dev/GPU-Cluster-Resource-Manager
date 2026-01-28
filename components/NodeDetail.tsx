
import React, { useState, useEffect } from 'react';
import { GpuNode, NodeTelemetry } from '../types';
import { getMockTelemetry } from '../services/mockData';
import { GoogleGenAI } from '@google/genai';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

interface NodeDetailProps {
  node: GpuNode;
  onClose: () => void;
}

const NodeDetail: React.FC<NodeDetailProps> = ({ node, onClose }) => {
  const [telemetry, setTelemetry] = useState<NodeTelemetry | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Simulate real-time data
    const interval = setInterval(() => {
      const data = getMockTelemetry(node.id);
      setTelemetry(data);
      setHistory(prev => [...prev.slice(-19), { 
        time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        temp: Math.max(...data.gpu_metrics.map(m => m.temperature_celsius)),
        util: Math.max(...data.gpu_metrics.map(m => m.gpu_utilization_percent))
      }]);
    }, 2000);

    return () => clearInterval(interval);
  }, [node.id]);

  const handleExportLogs = async () => {
    if (!telemetry) return;
    setIsExporting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate a realistic log file snippet (approx 50 lines) for a high-performance GPU compute node in a cluster. 
      Node Metadata:
      - Hostname: ${node.hostname}
      - ID: ${node.id}
      - Status: ${node.status}
      - Hardware: ${node.hardware_spec.gpu_count}x ${node.hardware_spec.gpu_model}
      - Current Max Temp: ${Math.max(...telemetry.gpu_metrics.map(m => m.temperature_celsius))}°C
      - Avg GPU Util: ${Math.floor(telemetry.gpu_metrics.reduce((acc, m) => acc + m.gpu_utilization_percent, 0) / node.hardware_spec.gpu_count)}%

      Include typical Linux kernel logs, NVIDIA driver events (XID errors if status is not ready, or healthy heartbeat if ready), systemd-journald entries, and cluster resource manager heartbeats. Use a realistic timestamp format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const logContent = response.text || "Failed to generate logs.";
      
      // Create and trigger download
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${node.hostname}_diagnostic_logs_${new Date().toISOString().split('T')[0]}.log`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export logs. Please check API connection.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!telemetry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-100">{node.hostname}</h3>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">{node.ip_address}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{node.hardware_spec.gpu_model} • {node.hardware_spec.gpu_count}x GPUs • CUDA {node.hardware_spec.cuda_version}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Individual GPU Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {telemetry.gpu_metrics.map((gpu) => (
              <div key={gpu.index} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">GPU {gpu.index}</p>
                  <span className={`text-xs font-bold ${gpu.temperature_celsius > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {gpu.temperature_celsius}°C
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>UTILIZATION</span>
                      <span>{gpu.gpu_utilization_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${gpu.gpu_utilization_percent}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>VRAM USAGE</span>
                      <span>{gpu.memory_utilization_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${gpu.memory_utilization_percent}%` }}></div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-700/50">
                    <span className="text-[10px] text-slate-500">POWER</span>
                    <span className="text-xs font-mono text-slate-300">{gpu.power_draw_watts}W</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                <h4 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider">Node Temperature Profile (Max GPU)</h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                         <XAxis dataKey="time" hide />
                         <YAxis domain={[0, 100]} stroke="#64748b" />
                         <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                         <Line type="stepAfter" dataKey="temp" stroke="#f43f5e" strokeWidth={2} dot={false} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
             </div>
             <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                <h4 className="text-sm font-semibold mb-4 text-slate-300 uppercase tracking-wider">Aggregate Performance History</h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={history}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                         <XAxis dataKey="time" hide />
                         <YAxis domain={[0, 100]} stroke="#64748b" />
                         <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                         <Bar dataKey="util" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
          <button 
            onClick={handleExportLogs}
            disabled={isExporting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <span>Export Logs</span>
            )}
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors">System Restart</button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
