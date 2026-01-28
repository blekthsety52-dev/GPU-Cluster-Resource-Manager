
import React, { useState } from 'react';

interface ProvisionNodeProps {
  onProvision: (data: any) => void;
}

const ProvisionNode: React.FC<ProvisionNodeProps> = ({ onProvision }) => {
  const [formData, setFormData] = useState({
    region: 'us-east-1',
    instance_type: 'p4d.24xlarge',
    image_id: 'ami-0c55b159cbfafe1f0',
    gpu_count: 8,
    tags: 'project:llm-training'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProvision(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Provision Infrastructure</h2>
        <p className="text-slate-400 mt-2">Scale your GPU cluster with new compute instances</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Deployment Region</label>
            <select 
              value={formData.region}
              onChange={e => setFormData({...formData, region: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-central-1">Europe (Frankfurt)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Instance Type</label>
            <select 
              value={formData.instance_type}
              onChange={e => setFormData({...formData, instance_type: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
            >
              <option value="p4d.24xlarge">p4d.24xlarge (8x A100)</option>
              <option value="p5.48xlarge">p5.48xlarge (8x H100)</option>
              <option value="g5.12xlarge">g5.12xlarge (4x A10G)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Machine Image (AMI/Docker ID)</label>
          <input 
            type="text"
            value={formData.image_id}
            onChange={e => setFormData({...formData, image_id: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">GPU Density (Units per Node)</label>
          <div className="flex items-center space-x-4">
             {[1, 2, 4, 8].map(num => (
               <button
                 key={num}
                 type="button"
                 onClick={() => setFormData({...formData, gpu_count: num})}
                 className={`flex-1 py-3 rounded-lg border font-bold transition-all ${
                   formData.gpu_count === num 
                   ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                   : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                 }`}
               >
                 {num}x
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Allocation Tags (Key:Value)</label>
          <textarea 
            rows={2}
            value={formData.tags}
            onChange={e => setFormData({...formData, tags: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
            placeholder="e.g. env:prod, team:ml-research"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-xs text-blue-400 font-medium flex items-center">
              <span className="mr-2">ℹ️</span>
              Estimated spin-up time for this configuration is 4-6 minutes.
            </p>
          </div>
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            Launch GPU Node Instance
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProvisionNode;
