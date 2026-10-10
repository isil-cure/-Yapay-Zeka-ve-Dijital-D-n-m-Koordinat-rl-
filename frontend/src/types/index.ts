export type Role = 'ADMIN' | 'STAFF';

export type AssetStatus = 'ACTIVE' | 'IN_STOCK' | 'IN_REPAIR' | 'SCRAPPED';

export type AssignmentAction = 'ASSIGN' | 'RETURN' | 'STATUS_CHANGE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: Role;
  createdAt?: string;
  assignedAssets?: Asset[];
  _count?: {
    assignedAssets: number;
    assignmentHistory?: number;
  };
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  status: AssetStatus;
  qrCode: string;
  assignedToUserId?: string | null;
  assignedToUser?: User | null;
  createdAt: string;
  updatedAt: string;
  assignmentLogs?: AssignmentHistory[];
  _count?: {
    assignmentLogs: number;
  };
}

export interface AssignmentHistory {
  id: string;
  assetId: string;
  asset?: Asset;
  userId?: string | null;
  user?: User | null;
  action: AssignmentAction;
  notes?: string | null;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  metrics: {
    totalAssets: number;
    activeAssigned: number;
    inStock: number;
    inRepair: number;
    scrapped: number;
  };
  recentActivities: AssignmentHistory[];
  departmentDistribution: Record<string, number>;
}
