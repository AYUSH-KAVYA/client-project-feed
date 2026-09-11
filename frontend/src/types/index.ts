export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type ModificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  createdAt: string;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  createdById: string;
  approvalStatus: ProjectApprovalStatus;
  createdAt: string;
  client?: Client;
  createdBy?: User;
  tasks?: Task[];
  _count?: {
    tasks: number;
    activityLogs: number;
  };
}

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  isOverdue: boolean;
  dueDate: string;
  projectId: string;
  assignedToId?: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    createdById?: string;
  };
  assignedTo?: User | null;
  activityLogs?: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  taskId: string;
  taskNumber: number;
  taskTitle: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  action: string;
  previousStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  message: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  taskId?: string | null;
  createdAt: string;
}

export interface ModificationRequest {
  id: string;
  title: string;
  description: string;
  status: ModificationStatus;
  devId: string;
  pmId: string;
  projectId: string;
  taskId?: string | null;
  createdAt: string;
  dev?: User;
  project?: { id: string; name: string };
  task?: { id: string; title: string; taskNumber: number };
}

export interface DashboardStats {
  role: Role;
  totalProjects?: number;
  totalClients?: number;
  totalUsers?: number;
  overdueCount?: number;
  activeOnlineUsersCount?: number;
  activeOnlineUsers?: Array<{ userId: string; name: string; email: string; role: string }>;
  tasksByStatus?: Record<TaskStatus, number>;
  tasksByPriority?: Record<TaskPriority, number>;
  projects?: Project[];
  upcomingTasks?: Task[];
  totalAssigned?: number;
  todoCount?: number;
  inProgressCount?: number;
  inReviewCount?: number;
  doneCount?: number;
  tasks?: Task[];
}
