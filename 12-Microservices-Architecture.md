# Microservices Architecture Documentation

**Version:** 1.0  
**Created:** December 2025  
**Purpose:** Complete microservices architecture guide for HDMS

---

## **Architecture Overview**

HDMS is built as a **microservices architecture** with Docker containerization. The system is divided into 5 main services, each handling a specific domain.

---

## **Service Breakdown**

### **1. User Service** (Port: 8001)
**Responsibility:** User management, authentication, SMS integration, user import

**Models:**
- User
- Department

**APIs:**
- `/api/v1/auth/login` - User login
- `/api/v1/auth/refresh` - Token refresh
- `/api/v1/users/` - User CRUD
- `/api/v1/users/import/` - Bulk user import

**Dependencies:** None (base service)

---

### **2. Ticket Service** (Port: 8002)
**Responsibility:** Ticket management, sub-tickets, approvals, SLA

**Models:**
- Ticket (with FSM)
- SubTicket
- Approval
- SLATemplate

**APIs:**
- `/api/v1/tickets/` - Ticket CRUD
- `/api/v1/tickets/{id}/status` - Status transitions
- `/api/v1/tickets/{id}/sub-tickets/` - Sub-ticket management
- `/api/v1/approvals/` - Approval workflow

**Dependencies:**
- User Service (validate users, get user details)

---

### **3. Communication Service** (Port: 8003, WebSocket: 8004)
**Responsibility:** Real-time chat, notifications, WebSocket handling

**Models:**
- ChatMessage
- Notification
- TicketParticipant

**APIs:**
- `/api/v1/chat/messages/` - Chat messages
- `/api/v1/notifications/` - Notifications
- `ws://gateway/ws/chat/{ticket_id}/` - WebSocket endpoint

**Dependencies:**
- User Service (get user details)
- Ticket Service (validate tickets, get ticket details)

---

### **4. File Service** (Port: 8005)
**Responsibility:** File uploads, antivirus scanning, file processing

**Models:**
- Attachment

**APIs:**
- `/api/v1/files/upload/` - File upload
- `/api/v1/files/{file_key}/` - File details
- `/api/v1/files/{file_key}/download/` - File download
- `/api/v1/files/{file_key}/status/` - Scan/processing status

**Dependencies:**
- User Service (validate users)
- Ticket Service (validate tickets)

**Background Tasks:**
- Antivirus scanning (Celery)
- Image conversion to WebP (Celery)
- Video transcoding to MP4 (Celery)

---

### **5. Frontend Service** (Port: 3000)
**Responsibility:** Next.js web application

**Configuration:**
- Calls API Gateway (not individual services)
- WebSocket connects through gateway
- Environment variables for gateway URLs

---

## **Infrastructure Services**

### **PostgreSQL** (Port: 5432)
- Shared database for all services
- Single database: `hdms_db`
- Each service uses different table names (no conflicts)

### **Redis** (Port: 6379)
- Database 0: User Service cache
- Database 1: Communication Service channel layer
- Database 2: Celery broker (File Service)

### **Nginx API Gateway** (Port: 80)
- Routes all API requests to appropriate services
- Handles WebSocket upgrades
- CORS configuration
- Rate limiting (future)

### **Celery Worker**
- Background tasks for File Service
- Antivirus scanning
- File processing

---

## **Service Communication**

### **Synchronous Communication (REST)**
- Services communicate via HTTP REST APIs
- Service URLs configured via environment variables
- Docker service names used for internal communication
- Example: `http://user-service:8001/api/v1/users/{id}/`

### **Asynchronous Communication**
- Redis pub/sub for real-time events
- Celery tasks for background processing

### **Frontend Communication**
- Frontend ONLY calls API Gateway
- Never calls individual services directly
- API Gateway routes to appropriate service

---

## **Database Strategy**

### **Current: Shared Database**
- All services use same PostgreSQL database
- Different table names per service
- UUID-based references (not ForeignKeys across services)
- Example: `ticket_id` (UUID) instead of `ForeignKey('tickets.Ticket')`

### **Future: Database Per Service**
- Can migrate to separate databases later
- Requires API calls instead of direct DB queries
- Better isolation and scalability

---

## **Docker Setup**

### **Development**
```bash
docker-compose up
```

### **Production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### **Service URLs (Internal)**
- User Service: `http://user-service:8001`
- Ticket Service: `http://ticket-service:8002`
- Communication Service: `http://communication-service:8003`
- File Service: `http://file-service:8005`
- Frontend Service: `http://frontend-service:3000`

### **External Access (via Gateway)**
- API: `http://localhost/api/v1/`
- WebSocket: `ws://localhost/ws/`
- Frontend: `http://localhost/`

---

## **Inter-Service Communication Pattern**

### **Example: Ticket Service calls User Service**

```python
from core.clients.user_client import UserClient

user_client = UserClient()
user_data = user_client.get_user(user_id, token)
```

### **Service Client Base Class**
Located in `services/shared/core/clients.py`
- Handles HTTP requests
- JWT token passing
- Error handling
- Timeout configuration

---

## **Environment Variables**

Each service has `.env.example` with:
- Database connection
- Service URLs
- JWT settings
- Service-specific configs

---

## **Migration from Monolith**

### **Strategy:**
1. **Phase 1:** Shared database, UUID references
2. **Phase 2:** Separate databases, API calls only
3. **Phase 3:** Service-specific optimizations

### **Key Changes:**
- ForeignKeys → UUID fields
- Direct DB queries → API calls
- Shared models → Service-specific models
- Single app → Multiple services

---

## **Deployment**

### **Docker Compose**
- All services in one `docker-compose.yml`
- Easy local development
- Simple production deployment

### **Scaling**
- Each service can scale independently
- Example: `docker-compose up --scale ticket-service=3`
- Load balancer routes to multiple instances

---

## **Monitoring & Logging**

### **Current:**
- Docker logs: `docker-compose logs [service-name]`
- Service-specific logging

### **Future:**
- Centralized logging (ELK stack)
- Metrics (Prometheus + Grafana)
- Distributed tracing (OpenTelemetry)

---

## **Security**

### **Service-to-Service:**
- JWT tokens passed in headers
- Internal network isolation (Docker networks)
- No public exposure of internal services

### **External Access:**
- Only API Gateway exposed
- JWT validation at gateway (future)
- Rate limiting at gateway (future)

---

## **File Structure**

```
services/
├── user-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       ├── manage.py
│       ├── core/
│       └── apps/
├── ticket-service/
├── communication-service/
├── file-service/
├── frontend-service/
└── shared/
    └── core/
        ├── models.py (BaseModel)
        └── clients.py (ServiceClient)
```

---

## **Next Steps**

1. ✅ All services created
2. ⏳ Complete inter-service clients
3. ⏳ Update frontend to use API Gateway
4. ⏳ Database migration scripts
5. ⏳ Testing and deployment

---

**Last Updated:** December 2025


