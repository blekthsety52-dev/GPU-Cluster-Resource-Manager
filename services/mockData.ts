
import { GpuNode, NodeStatus, ClusterHealthReport, NodeTelemetry, Alert } from '../types';

export const MOCK_NODES: GpuNode[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    hostname: 'node-h100-01',
    ip_address: '10.0.1.10',
    status: NodeStatus.READY,
    hardware_spec: {
      gpu_model: 'NVIDIA H100',
      gpu_count: 8,
      vram_per_gpu_gb: 80,
      cuda_version: '12.2',
      driver_version: '535.104.05'
    },
    created_at: '2023-10-01T10:00:00Z'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    hostname: 'node-h100-02',
    ip_address: '10.0.1.11',
    status: NodeStatus.BUSY,
    hardware_spec: {
      gpu_model: 'NVIDIA H100',
      gpu_count: 8,
      vram_per_gpu_gb: 80,
      cuda_version: '12.2',
      driver_version: '535.104.05'
    },
    created_at: '2023-10-01T11:00:00Z'
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    hostname: 'node-a100-01',
    ip_address: '10.0.2.10',
    status: NodeStatus.DRAINING,
    hardware_spec: {
      gpu_model: 'NVIDIA A100',
      gpu_count: 4,
      vram_per_gpu_gb: 40,
      cuda_version: '11.8',
      driver_version: '525.60.13'
    },
    created_at: '2023-09-15T08:30:00Z'
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174003',
    hostname: 'node-a100-02',
    ip_address: '10.0.2.11',
    status: NodeStatus.MAINTENANCE,
    hardware_spec: {
      gpu_model: 'NVIDIA A100',
      gpu_count: 4,
      vram_per_gpu_gb: 40,
      cuda_version: '11.8',
      driver_version: '525.60.13'
    },
    created_at: '2023-09-15T09:00:00Z'
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    severity: 'warning',
    component: 'node-h100-01',
    message: 'High temperature detected on GPU 3 (78°C)',
    timestamp: new Date().toISOString()
  },
  {
    severity: 'info',
    component: 'Provisioner',
    message: 'Scaling up: 2 new nodes initializing',
    timestamp: new Date().toISOString()
  }
];

export const getMockTelemetry = (nodeId: string): NodeTelemetry => ({
  node_id: nodeId,
  timestamp: new Date().toISOString(),
  gpu_metrics: Array.from({ length: 4 }).map((_, i) => ({
    index: i,
    temperature_celsius: 45 + Math.floor(Math.random() * 25),
    power_draw_watts: 150 + Math.floor(Math.random() * 150),
    fan_speed_percent: 30 + Math.floor(Math.random() * 50),
    gpu_utilization_percent: Math.floor(Math.random() * 100),
    memory_utilization_percent: Math.floor(Math.random() * 100)
  })),
  system_load: 0.5 + Math.random() * 2,
  disk_usage_percent: 45
});
