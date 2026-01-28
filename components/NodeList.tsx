
import React from 'react';
import { GpuNode, NodeStatus } from '../types';

interface NodeListProps {
  nodes: GpuNode[];
  onDrain: (id: string) => void;
  onDecommission: (id: string) => void;
  onSelectNode: (node: GpuNode) => void;
}

const NodeList: React.FC<NodeListProps> = ({ nodes, onDrain, onDecommission, onSelectNode }) => {
  const getStatusStyle = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.READY: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case NodeStatus.BUSY: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case NodeStatus.DRAINING: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case NodeStatus.MAINTENANCE: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case NodeStatus.OFFLINE: return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">GPU Cluster Nodes</h2>
          <p className="text-slate-400">Inventory and lifecycle management</p>
        </div>
        <div className="flex space-x-3">
           <div className="relative">
              <input 
                type="text" 
                placeholder="Search nodes..." 
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
              />
           </div>
        </div>
      </div>

      <div className="overflow-hidden bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Node Hostname</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Hardware</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {nodes.map((node) => (
              <tr 
                key={node.id} 
                className="hover:bg-slate-700/20 transition-colors cursor-pointer group"
                onClick={() => onSelectNode(node)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${node.status === NodeStatus.READY ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`}></div>
                    <div>
                      <p className="font-medium text-slate-200">{node.hostname}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">{node.id.split('-')[0]}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusStyle(node.status)}`}>
                    {node.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <p className="text-slate-300 font-medium">{node.hardware_spec.gpu_model}</p>
                    <p className="text-slate-500">{node.hardware_spec.gpu_count}x GPUs | {node.hardware_spec.vram_per_gpu_gb}GB VRAM</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="mono text-xs text-slate-400">{node.ip_address}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {node.status !== NodeStatus.DRAINING && node.status !== NodeStatus.OFFLINE && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDrain(node.id); }}
                        className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded transition-all text-xs font-semibold"
                        title="Drain Node"
                      >
                        Drain
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDecommission(node.id); }}
                      className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded transition-all text-xs font-semibold"
                      title="Decommission"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodeList;
