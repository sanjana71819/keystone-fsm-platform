export type Role = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'CUSTOMER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type WorkOrderStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  enabled: boolean;
  customerId?: number;
  technicianId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  customerId?: number;
  technicianId?: number;
}

export interface Customer {
  id: number;
  userId?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  contactPhone?: string;
  billingAddress?: string;
  notes?: string;
  facilitiesCount: number;
  createdAt: string;
}

export interface Facility {
  id: number;
  customerId: number;
  customerCompanyName?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface Technician {
  id: number;
  userId?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  skills?: string;
  certifications?: string;
  available: boolean;
  notes?: string;
  activeWorkOrdersCount: number;
  createdAt: string;
}

export interface ServiceRequest {
  id: number;
  customerId: number;
  customerCompanyName?: string;
  customerContact?: string;
  facilityId?: number;
  facilityName?: string;
  facilityAddress?: string;
  title: string;
  description?: string;
  priority: Priority;
  status: RequestStatus;
  slaHours: number;
  dueAt?: string;
  resolvedAt?: string;
  isOverdue: boolean;
  workOrderId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkOrderPart {
  id: number;
  partId: number;
  partName: string;
  sku: string;
  quantityUsed: number;
  unitPrice: number;
  totalCost: number;
}

export interface TimeEntry {
  id: number;
  workOrderId: number;
  technicianId: number;
  technicianName?: string;
  clockIn: string;
  clockOut?: string;
  durationHours?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: number;
  serviceRequestId: number;
  serviceRequestTitle?: string;
  customerCompanyName?: string;
  facilityName?: string;
  facilityAddress?: string;
  technicianId?: number;
  technicianName?: string;
  technicianPhone?: string;
  status: WorkOrderStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  parts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  totalHours?: number;
  totalPartsCost?: number;
}

export interface Part {
  id: number;
  name: string;
  sku: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  isLowStock: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalServiceRequests: number;
  openServiceRequests: number;
  inProgressServiceRequests: number;
  resolvedServiceRequests: number;
  overdueServiceRequests: number;

  totalWorkOrders: number;
  openWorkOrders: number;
  assignedWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;

  totalTechnicians: number;
  availableTechnicians: number;

  totalCustomers: number;
  totalFacilities: number;

  totalParts: number;
  lowStockPartsCount: number;

  totalHoursLogged: number;

  requestsByPriority: Record<string, number>;
  workOrdersByStatus: Record<string, number>;
  technicianPerformances: Array<{
    technicianId: number;
    technicianName: string;
    activeOrders: number;
    completedOrders: number;
    totalHours: number;
    available: boolean;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    entityName: string;
    timestamp: string;
  }>;
}
