export type Role = 'ADMIN' | 'STAFF';
export const Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;

export type AssetStatus = 'ACTIVE' | 'IN_STOCK' | 'IN_REPAIR' | 'SCRAPPED';
export const AssetStatus = {
  ACTIVE: 'ACTIVE',
  IN_STOCK: 'IN_STOCK',
  IN_REPAIR: 'IN_REPAIR',
  SCRAPPED: 'SCRAPPED',
} as const;

export type AssignmentAction = 'ASSIGN' | 'RETURN' | 'STATUS_CHANGE';
export const AssignmentAction = {
  ASSIGN: 'ASSIGN',
  RETURN: 'RETURN',
  STATUS_CHANGE: 'STATUS_CHANGE',
} as const;
