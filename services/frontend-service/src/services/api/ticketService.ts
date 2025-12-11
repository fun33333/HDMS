/**
 * Ticket Service
 * All ticket-related API calls
 */

import apiClient from './axiosClient';
import { Ticket, Comment } from '../../types';
import { ENV } from '../../config/env';
import { getMockTickets, getMockTicketById } from '../../lib/mockData';

export interface CreateTicketData {
  subject: string;
  description: string;
  department: string; // name
  departmentId?: string; // id
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  status?: string;
  requestorId: string;
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
  requestorId?: string;
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
  // Helper: Map Backend API Response to Frontend Ticket
  private mapToTicket(data: any): Ticket {
    return {
      id: data.id,
      ticketId: `HD-${new Date(data.created_at).getFullYear()}-${String(data.version || 1).padStart(4, '0')}`, // Mock generation
      subject: data.title,
      description: data.description,
      department: data.department_id || 'Unknown', // Need lookup
      priority: data.priority,
      status: data.status,
      requestorId: data.requestor_id,
      requestorName: 'Current User', // TODO: Fetch from user service
      submittedDate: data.created_at,
      assignedDate: data.updated_at, // Mock
      attachments: (data.attachments || []).map((att: any) => ({
        id: att.id,
        name: att.filename,
        url: att.file,
        size: att.file_size,
        type: att.content_type,
        uploadDate: att.created_at,
      })),
    };
  }

  // Get all tickets with filters
  async getTickets(filters?: TicketFilters): Promise<TicketListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }

      // Use specific Ticket Service URL
      const response = await apiClient.get<any[]>(`${ENV.TICKET_SERVICE_URL}/api/v1/tickets/?${params.toString()}`);

      // Map API response to Ticket type
      const tickets = response.map(this.mapToTicket);

      return {
        results: tickets,
        count: tickets.length,
        next: null,
        previous: null
      };
    } catch (error) {
      console.warn('API Error, falling back to mock:', error);
      // Fallback
      return {
        results: getMockTickets(filters?.requestorId || 'user-1'),
        count: 10,
        next: null,
        previous: null
      };
    }
  }

  // Get single ticket by ID
  async getTicketById(id: string): Promise<Ticket> {
    try {
      const response = await apiClient.get<any>(`${ENV.TICKET_SERVICE_URL}/api/v1/tickets/${id}`);
      return this.mapToTicket(response);
    } catch (error) {
      console.warn('API Error, falling back to mock:', error);
      const mock = getMockTicketById(id);
      if (!mock) throw error;
      return mock;
    }
  }

  // Create new ticket
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    try {
      const payload = {
        title: data.subject,
        description: data.description,
        department_id: data.departmentId || '00000000-0000-0000-0000-000000000000', // Mock/Placeholder if not provided
        priority: data.priority,
        category: data.category || '',
        requestor_id: data.requestorId, // Should come from auth context
        status: data.status || 'draft'
      };

      const ticketResponse = await apiClient.post<any>(`${ENV.TICKET_SERVICE_URL}/api/v1/tickets/`, payload);

      // Handle attachments
      if (data.attachments && data.attachments.length > 0) {
        await Promise.all(data.attachments.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          // Upload to new endpoint
          await apiClient.post(`${ENV.TICKET_SERVICE_URL}/api/v1/tickets/${ticketResponse.id}/attachments`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }));
      }

      return this.mapToTicket(ticketResponse);
    } catch (error) {
      console.error('Create ticket failed:', error);
      throw error; // Let UI handle error
    }
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

