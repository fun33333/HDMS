# Help Desk Management System (HDMS) - Microservices Architecture

**Version:** 2.0  
**Last Updated:** December 2025  
**Architecture:** Microservices with Docker

---

## **Quick Start**

### **Start All Services**
```bash
docker-compose up
```

### **Access Application**
- **Frontend:** http://localhost
- **API Gateway:** http://localhost/api/v1/
- **WebSocket:** ws://localhost/ws/

### **Development Mode**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

For detailed setup, see [README-Microservices.md](README-Microservices.md)

---

## **Documentation Index**

### **Core Documentation**
- [01-Project-Charter.md](01-Project-Charter.md) - Project overview and goals
- [02-Roles-and-Permissions.md](02-Roles-and-Permissions.md) - Role definitions and permissions
- [03-Technical-Architecture.md](03-Technical-Architecture.md) - Technical stack and architecture
- [04-Ticket-Lifecycle.md](04-Ticket-Lifecycle.md) - Ticket status flows and lifecycle
- [05-Workflows-by-Role.md](05-Workflows-by-Role.md) - Role-based workflows
- [06-API-Specifications.md](06-API-Specifications.md) - API endpoints and schemas
- [07-Business-Rules.md](07-Business-Rules.md) - Business rules and constraints
- [08-Project-Deliverables.md](08-Project-Deliverables.md) - MVP deliverables

### **Database & Models**
- [09-Database-Design.md](09-Database-Design.md) - ERD and database design
- [10-Models-Decisions.md](10-Models-Decisions.md) - Model design decisions

### **Implementation**
- [11-Implementation-Task-List.md](11-Implementation-Task-List.md) - Priority-based task list
- [12-Microservices-Architecture.md](12-Microservices-Architecture.md) - Microservices architecture details
- [13-Database-Migration-Strategy.md](13-Database-Migration-Strategy.md) - Migration from monolith to microservices

---

## **Microservices Overview**

### **Services**
1. **User Service** - Authentication, user management, SMS integration, user import
2. **Ticket Service** - Tickets, sub-tickets, approvals, SLA
3. **Communication Service** - Chat, notifications, WebSocket
4. **File Service** - File uploads, antivirus scanning, processing
5. **Frontend Service** - Next.js application

### **Infrastructure**
- **API Gateway:** Nginx
- **Database:** PostgreSQL (shared initially)
- **Cache/Queue:** Redis
- **Orchestration:** Docker Compose

---

## **Key Features**

- ✅ Microservices architecture with Docker
- ✅ API Gateway (Nginx) for routing
- ✅ JWT authentication
- ✅ Real-time chat (Django Channels)
- ✅ File upload with antivirus scanning
- ✅ User import functionality
- ✅ UUID primary keys
- ✅ Soft delete pattern
- ✅ FSM for ticket status management

---

## **Tech Stack**

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Django 5, Django Ninja, Django Channels
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis 7
- **Containerization:** Docker, Docker Compose
- **API Gateway:** Nginx

---

**For detailed documentation, see individual documentation files.**
