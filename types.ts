
export enum NodeStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  BUSY = 'busy',
  DRAINING = 'draining',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline'
}

export interface HardwareSpec {
  gpu_model: string;
  gpu_count: number;
  vram_per_gpu_gb: number;
  cuda_version: string;
  driver_version: string;
}

export interface GpuNode {
  id: string;
  hostname: string;
  ip_address: string;
  status: NodeStatus;
  hardware_spec: HardwareSpec;
  created_at: string;
}

export interface Alert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  timestamp: string;
}

export interface ClusterHealthReport {
  status: 'healthy' | 'degraded' | 'critical';
  total_nodes: number;
  available_nodes: number;
  total_gpus: number;
  available_gpus: number;
  utilization_percentage: number;
  active_alerts: Alert[];
}

export interface GpuMetric {
  index: number;
  temperature_celsius: number;
  power_draw_watts: number;
  fan_speed_percent: number;
  gpu_utilization_percent: number;
  memory_utilization_percent: number;
}

export interface NodeTelemetry {
  node_id: string;
  timestamp: string;
  gpu_metrics: GpuMetric[];
  system_load: number;
  disk_usage_percent: number;
}

export interface AllocationRequest {
  job_id: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  resources: {
    gpu_count: number;
    min_vram_gb: number;
    cpu_cores: number;
    ram_gb: number;
  };
}

export interface AllocationReceipt {
  allocation_id: string;
  node_id: string;
  gpu_indices: number[];
  lease_expiration: string;
}
