
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NodeList from './components/NodeList';
import NodeDetail from './components/NodeDetail';
import ProvisionNode from './components/ProvisionNode';
import { MOCK_NODES, MOCK_ALERTS } from './services/mockData';
import { GpuNode, NodeStatus, ClusterHealthReport, Alert } from './types';

// Functional component for Header
const Header: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <header className="mb-8">
    <h1 className="text-3xl font-bold text-slate-100">{title}</h1>
    <p className="text-slate-400 mt-1">{subtitle}</p>
  </header>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [nodes, setNodes] = useState<GpuNode[]>(MOCK_NODES);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [selectedNode, setSelectedNode] = useState<GpuNode | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const healthReport = useMemo<ClusterHealthReport>(() => {
    const total_gpus = nodes.reduce((acc, n) => acc + n.hardware_spec.gpu_count, 0);
    const available_nodes = nodes.filter(n => n.status === NodeStatus.READY).length;
    const utilization = 72.4; // Simulated aggregate

    return {
      status: alerts.some(a => a.severity === 'critical') ? 'critical' : 
              alerts.some(a => a.severity === 'warning') ? 'degraded' : 'healthy',
      total_nodes: nodes.length,
      available_nodes,
      total_gpus,
      available_gpus: Math.floor(total_gpus * 0.4), // Simulated
      utilization_percentage: utilization,
      active_alerts: alerts
    };
  }, [nodes, alerts]);

  const handleDrain = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: NodeStatus.DRAINING } : n));
    const newAlert: Alert = {
      severity: 'warning',
      component: 'Lifecycle',
      message: `Node ${nodes.find(n => n.id === id)?.hostname} is now draining for maintenance.`,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleDecommission = (id: string) => {
    if (confirm('Are you sure you want to decommission this node? This action is irreversible.')) {
      setNodes(prev => prev.filter(n => n.id !== id));
      const newAlert: Alert = {
        severity: 'info',
        component: 'Lifecycle',
        message: `Node decommissioned successfully. resources recovered.`,
        timestamp: new Date().toISOString()
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleProvision = (data: any) => {
    setIsProvisioning(true);
    // Simulate API delay
    setTimeout(() => {
      const newNode: GpuNode = {
        id: crypto.randomUUID(),
        hostname: `node-${data.instance_type.split('.')[0]}-${Math.floor(Math.random() * 999)}`,
        ip_address: `10.0.3.${nodes.length + 1}`,
        status: NodeStatus.INITIALIZING,
        hardware_spec: {
          gpu_model: data.instance_type.includes('p5') ? 'NVIDIA H100' : 'NVIDIA A100',
          gpu_count: data.gpu_count,
          vram_per_gpu_gb: data.instance_type.includes('p5') ? 80 : 40,
          cuda_version: '12.2',
          driver_version: '535.104.05'
        },
        created_at: new Date().toISOString()
      };
      setNodes(prev => [...prev, newNode]);
      setAlerts(prev => [{
        severity: 'info',
        component: 'Provisioner',
        message: `Spinning up new node: ${newNode.hostname}`,
        timestamp: new Date().toISOString()
      }, ...prev]);
      setIsProvisioning(false);
      setActiveTab('nodes');

      // Finish initializing after 5 seconds
      setTimeout(() => {
        setNodes(curr => curr.map(n => n.id === newNode.id ? { ...n, status: NodeStatus.READY } : n));
      }, 5000);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard health={healthReport} nodes={nodes} alerts={alerts} />
        )}

        {activeTab === 'nodes' && (
          <NodeList 
            nodes={nodes} 
            onDrain={handleDrain} 
            onDecommission={handleDecommission} 
            onSelectNode={setSelectedNode} 
          />
        )}

        {activeTab === 'provision' && (
          <ProvisionNode onProvision={handleProvision} />
        )}

        {activeTab === 'allocate' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4">📎</div>
             <h2 className="text-2xl font-bold">Resource Allocation</h2>
             <p className="text-slate-400 max-w-md">The scheduler is currently processing 14 active jobs. You can reserve GPU resources for specific compute workloads here.</p>
             <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">New Allocation Request</button>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <Header title="Cluster Health Analysis" subtitle="Advanced telemetry and predictive diagnostics" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">Fragmentation Report</h3>
                  <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '65%' }}></div>
                    <div className="h-full bg-amber-500" style={{ width: '20%' }}></div>
                    <div className="h-full bg-rose-500" style={{ width: '15%' }}></div>
                  </div>
                  <div className="mt-4 flex space-x-4 text-xs">
                     <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Contiguous (Busy)</span>
                     <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>Fragmented</span>
                     <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Free/Available</span>
                  </div>
               </div>
               <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">Thermal Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Mean Temperature</span>
                      <span className="text-emerald-400 font-bold">52.4°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Pwr Consumption</span>
                      <span className="text-slate-200 font-bold">4.2 kW</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Overlays */}
      {selectedNode && (
        <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}

      {isProvisioning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
           <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold mb-2">Deploying Node...</h3>
              <p className="text-slate-400">Communicating with the cloud controller to provision hardware</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
