# Project Deliverables

## **PROJECT DELIVERABLES — *Help Desk Management System (MVP)***

The deliverables represent the tangible system components to be developed, tested, and deployed during the 1-month MVP phase.

---

### **System Deliverables**

| Category | Deliverable | Description |
| ----- | ----- | ----- |
| **1. Authentication Module** | Centralized Employee Login | Integration with the existing SMS system for shared employee credentials. |
|  | Role & Access Control | HDMS Admin can authorize SMS employees for access to the help desk. |
| **2. Ticketing System** | Ticket Creation & Tracking | Department-wise request creation with status updates. |
|  | Linked/Sub-Tickets | Support multi-department workflows under a single parent ticket. (Moderator-controlled creation) |
|  | Commenting System | Discussion area for all users involved in a ticket. |
|  | File Attachments | Upload supporting documents or proofs with tickets. |
| **3. Workflow Automation** | Approval Hierarchy | Configurable approval routes (Department Head → CEO → Accounts). |
|  | Ticket States & Transitions | Defined states: *Draft, Submitted, Pending, Under_Review, Assigned, In_Progress, Waiting_Approval, Approved/Rejected, Resolved, Closed, Reopened, Postponed*. |
| **4. Dashboard & Analytics** | Department Dashboard | Each department sees its open, pending, and resolved tickets. |
|  | CEO/Management Dashboard | Organization-level ticket overview and insights. |
| **5. Notification System** | Real-Time Alerts | Notify users on ticket updates, approvals, or assignments. |
| **6. Integration Layer** | SMS Integration API | Synchronize employee and department data between SMS and HDMS. |
|  | Centralized User Directory | Unified storage for employees across systems. |
| **7. Deployment Setup** | Cloud or Internal Deployment | Stable version hosted for Idara Al-Khair's internal use. |
| **8. Documentation (Basic)** | API & Module Documentation | Technical documentation for internal maintenance. |

---

### **Expected MVP Output**

At the end of 1 month, Idara Al-Khair will have a **fully functional internal Help Desk Management System (HDMS)** capable of:

* Handling multi-department requests

* Managing interlinked ticket workflows

* Operating with shared employee data from SMS

* Providing a management dashboard for real-time operational insight

* Supporting real-time chat for all ticket participants

* Automating approval workflows

* Tracking ticket lifecycle with full audit trails

---

### **MVP Features Checklist**

#### **Core Features**
- [x] Role-based authentication (Requester, Moderator, Assignee, Admin)
- [x] Ticket creation and submission
- [x] Draft saving (soft-deleted after 7 days)
- [x] Ticket assignment to departments
- [x] Status tracking and transitions
- [x] Real-time chat system
- [x] File attachments
- [x] Sub-ticket creation (Moderator only)
- [x] Approval workflow (Finance → CEO)
- [x] Postponement with reminders
- [x] Auto-close functionality
- [x] Reopen capability (max 2 times)
- [x] Notification system
- [x] Audit logging

#### **Dashboard Features**
- [x] Department dashboard
- [x] CEO/Management dashboard
- [x] Personal analytics (Requester)
- [x] Department metrics (Assignee)
- [x] System-wide analytics (Admin/Moderator)

#### **Integration Features**
- [x] SMS user authentication
- [x] Employee data sync
- [x] Role authorization control

---

### **Out of Scope (for MVP, but Planned Later)**

These will be part of **Phase 2** or later versions:

* AI-powered ticket classification and priority tagging
* SLA tracking and automated escalation
* Voice-based ticket interaction
* Requester satisfaction surveys
* Organization-wide analytics dashboard
* Mobile application version
* Advanced reporting and exports
* Custom workflow builder

---

### **Technical Deliverables**

#### **Architecture**
- [x] Microservices architecture with Docker
- [x] 5 independent services (User, Ticket, Communication, File, Frontend)
- [x] API Gateway (Nginx) for request routing
- [x] Shared PostgreSQL database (initially)
- [x] Docker Compose orchestration
- [x] Inter-service HTTP clients
- [x] Shared BaseModel for consistency

#### **Frontend**
* Next.js 15 application with TypeScript
* Role-based routing and layouts
* Real-time chat interface
* Dashboard components
* Responsive design

#### **Backend**
* Django 5 + Django Ninja API
* PostgreSQL database with PgBouncer connection pooling
* Django Channels for WebSockets (native WebSocket, not Socket.IO)
* Celery for background tasks (high/low priority queues)
* Redis for caching (Cache-Aside pattern) and queues
* django-fsm for state machine implementation
* Optimistic locking (version fields) and pessimistic locking
* Transaction management with @transaction.atomic

#### **Infrastructure**
* Deployment configuration
* Environment setup (secrets management via environment variables)
* Database migrations (with rollback procedures)
* Database backup strategy (daily full backups, 15-30 minute transaction logs)
* CI/CD pipeline (basic) - deferred to later phase
* Observability infrastructure - deferred to production phase

---

### **Documentation Deliverables**

* API documentation (OpenAPI/Swagger auto-generated)
* Database schema documentation
* Deployment guide
* User guides (per role)
* Developer onboarding guide
* Architecture documentation (Technical Architecture document)
* Business rules documentation
* API versioning strategy documentation

---

### **Testing Deliverables**

* Unit tests (Frontend & Backend)
* Integration tests
* End-to-end test scenarios
* Test coverage reports
* **Test Coverage Target:** 80%+ code coverage
* **Performance Testing:** Load testing for API endpoints, stress testing for WebSocket connections
* **Security Testing:** Authentication/authorization tests, input validation tests, SQL injection tests, XSS prevention tests

---

### **Success Metrics**

The MVP will be considered successful if:

* 100% of the seven pilot departments onboarded successfully
* All tickets routed through the Moderator workflow
* Ticket closure verification functional and auditable
* Minimum 50% of authorized employees logging in and submitting/approving requests within the first month
* System replaces at least 60–70% of WhatsApp-based approval traffic
* Core metrics (speed, uptime, and adoption) meet targets




