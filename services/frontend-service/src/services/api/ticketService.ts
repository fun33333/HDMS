/**
 * Ticket Service
 * All ticket-related API calls
 */

import apiClient from './axiosClient';
import { Ticket, Comment } from '../../types';

export interface CreateTicketData {
  subject: string;
  description: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: File[];
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  department?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
  assigneeId?: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  department?: string;
  assigneeId?: string;
  requesterId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TicketListResponse {
  results: Ticket[];
  count: number;
  next: string | null;
  previous: string | null;
}

class TicketService {
  // Get all tickets with filters
  async getTickets(filters?: TicketFilters): Promise<TicketListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    return apiClient.get<TicketListResponse>(`/api/tickets/?${params.toString()}`);
  }

  // Get single ticket by ID
  async getTicketById(id: string): Promise<Ticket> {
    return apiClient.get<Ticket>(`/api/tickets/${id}/`);
  }

  // Create new ticket
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('department', data.department);
    formData.append('priority', data.priority);
    
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    return apiClient.post<Ticket>('/api/tickets/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Update ticket
  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    return apiClient.patch<Ticket>(`/api/tickets/${id}/`, data);
  }

  // Delete ticket
  async deleteTicket(id: string): Promise<void> {
    return apiClient.delete(`/api/tickets/${id}/`);
  }

  // Assign ticket
  async assignTicket(ticketId: string, assigneeId: string): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/assign/`, { assigneeId });
  }

  // Reassign ticket
  async reassignTicket(ticketId: string, assigneeId: string, reason: string): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/reassign/`, {
      assigneeId,
      reason,
    });
  }

  // Change ticket status
  async changeStatus(ticketId: string, status: string, note?: string): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/status/`, {
      status,
      note,
    });
  }

  // Change ticket priority
  async changePriority(ticketId: string, priority: string): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/priority/`, {
      priority,
    });
  }

  // Add comment
  async addComment(ticketId: string, content: string): Promise<Comment> {
    return apiClient.post<Comment>(`/api/tickets/${ticketId}/comments/`, {
      content,
    });
  }

  // Get comments
  async getComments(ticketId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/api/tickets/${ticketId}/comments/`);
  }

  // Approve ticket
  async approveTicket(ticketId: string): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/approve/`);
  }

  // Reject ticket
  async rejectTicket(ticketId: string, reason: string): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/reject/`, {
      reason,
    });
  }

  // Complete ticket
  async completeTicket(ticketId: string, note: string, image?: File): Promise<Ticket> {
    const formData = new FormData();
    formData.append('note', note);
    if (image) {
      formData.append('image', image);
    }
    
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/complete/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Split ticket into subtickets
  async splitTicket(ticketId: string, subtickets: Array<{ subject: string; description: string }>): Promise<Ticket> {
    return apiClient.post<Ticket>(`/api/tickets/${ticketId}/split/`, {
      subtickets,
    });
  }

  // Get ticket statistics
  async getStatistics(role?: string): Promise<any> {
    const params = role ? `?role=${role}` : '';
    return apiClient.get(`/api/tickets/statistics/${params}`);
  }
}

export const ticketService = new TicketService();
export default ticketService;

