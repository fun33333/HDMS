/**
 * User Type Definitions
 */

export type UserRole = 'requester' | 'moderator' | 'assignee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  employeeCode?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  joinDate?: string;
  permissions?: string[];
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserStats {
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  avgResolutionTime: string;
  satisfactionRating?: number;
}

