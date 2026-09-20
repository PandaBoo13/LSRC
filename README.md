# LSRC E-Learning Platform

> A Learning Management System (LMS) combined with an international study consulting platform for Vietnamese students.

## Overview

**LSRC (Learning Support & Resource Center)** is an online learning and international education platform designed to support Vietnamese students throughout their learning and study-abroad journey.

The platform combines:

* **Learning Management System (LMS)**
* **Online course management**
* **International study consulting**
* **Learning progress tracking**
* **Online assessment**
* **Real-time communication**
* **Payment and order management**
* **Certificate management**

LSRC connects students with international education programs from partners in **Singapore, Canada, the United Kingdom, and Switzerland** through a course aggregation and LMS model.

## Main Partners

| Partner                | Country        | Programs                              |
| ---------------------- | -------------- | ------------------------------------- |
| **Birmingham Academy** | Singapore      | AEIS, OSSD, Diploma, Advanced Diploma |
| **SHMS**               | Switzerland    | Bachelor Degree                       |
| **DMU**                | United Kingdom | Bachelor Degree                       |
| **Pearson Edexcel**    | United Kingdom | Vocational Certificates               |
| **OTHM**               | United Kingdom | Professional Certificates             |

## System Goals

* **Online Learning** — Support both LIVE and SELF_PACED courses
* **Study Consulting** — Connect students with international education programs
* **Certification** — Automatically issue certificates after course completion
* **Real-time Communication** — Enable communication between instructors and students
* **Progress Tracking** — Track learning progress at course and lesson level
* **Online Payment** — Support VNPay, COD, and multiple currencies

---

# Architecture

The system follows a layered backend architecture with a React frontend and supporting infrastructure services.

```text
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT - React + Vite                     │
│                                                              │
│      ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│      │  Student   │    │  Teacher   │    │   Admin    │     │
│      └────────────┘    └────────────┘    └────────────┘     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                       REST API + WebSocket
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  BACKEND - Spring Boot 3.4                   │
│                                                              │
│   Controller → Service → Repository                          │
│        │            │            │                            │
│        ▼            ▼            ▼                            │
│   Validator      Mapper      JPA/Hibernate                   │
│                                                              │
│   Security: JWT + RBAC + Permission Filter                   │
└──────────────────────────────┬───────────────────────────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
        ┌─────────┐       ┌──────────┐      ┌────────────┐
        │  MySQL  │       │  Uploads │      │   VNPay    │
        │   8.0   │       │  Files   │      │  Gateway   │
        └─────────┘       └──────────┘      └────────────┘
```

## Technology Stack

| Layer                  | Technology                   |
| ---------------------- | ---------------------------- |
| Backend                | Java 17, Spring Boot 3.4     |
| Security               | Spring Security, JWT, OAuth2 |
| ORM                    | Spring Data JPA / Hibernate  |
| Database               | MySQL 8.0                    |
| Frontend               | React 18, TypeScript 5, Vite |
| UI                     | TailwindCSS                  |
| State Management       | React Hooks / Custom Hooks   |
| Realtime Communication | WebSocket / STOMP            |
| Payment                | VNPay Sandbox                |
| File Storage           | Local filesystem             |

---

# Key Features

## 1. Authentication & Authorization

* Email registration and login
* Google and Facebook OAuth2
* Access token and refresh token
* Password recovery via OTP
* Role-Based Access Control (RBAC)
* Three default roles:

  * `ADMIN`
  * `TEACHER`
  * `STUDENT`
* Fine-grained permissions based on `resource + action`
* Custom permissions for individual accounts

## 2. Course Management

* Course CRUD operations
* Course status workflow:

  * `DRAFT`
  * `PENDING_REVIEW`
  * `PUBLISHED`
  * `ARCHIVED`
* Course types:

  * `LIVE`
  * `SELF_PACED`
* Free, paid, and discounted courses
* Course thumbnail management
* Course prerequisites
* Course cloning
* Hierarchical course categories

## 3. Learning Content

The platform supports multiple learning resource types:

```text
VIDEO
QUIZ
PDF
SLIDE
AUDIO
DOCUMENT
IMAGE
LINK
SCORM
OTHER
```

Features include:

* Course → Chapter → Resource hierarchy
* Resource ordering
* Free preview lessons
* Automatic video duration detection
* Resource publishing and processing states

## 4. Quiz & Question Bank

Supported question types:

```text
SINGLE_CHOICE
MULTIPLE_CHOICE
TRUE_FALSE
SHORT_ANSWER
```

Quiz features:

* Question bank management
* Hashtag-based question selection
* Randomized questions
* Maximum attempt configuration
* Time limits
* Passing scores
* Question shuffling
* Weighted quiz scoring
* Draft and submission workflow
* Quiz result review

## 5. Learning Progress

The system supports two progress calculation modes:

### Completion-Based

Progress is calculated based on the number of completed lessons/resources.

### Weighted Grade

Progress is calculated based on configured quiz weights.

Additional capabilities:

* Video completion validation
* Minimum video-watch requirement
* Actual study-time tracking
* Automatic progress recalculation
* Progress synchronization with orders/enrollments

## 6. Orders & Payments

* Shopping cart
* Order management
* Free-course enrollment without payment
* VNPay payment
* Cash on Delivery (COD)
* Multi-currency conversion
* VNPay callback/IPN handling
* Automatic invoice generation

Invoice prefixes:

```text
INV-
INV-FREE-
```

## 7. Real-time Chat

The platform provides real-time communication using WebSocket.

Supported conversation types:

```text
PRIVATE
GROUP
COURSE
```

Features:

* WebSocket communication
* REST fallback
* Conversation member roles
* Reply to messages
* Edit messages
* Delete messages
* Mute members
* Ban members
* Transfer conversation ownership

Supported message types:

```text
TEXT
IMAGE
FILE
VIDEO
AUDIO
SYSTEM
```

## 8. Notifications

* Multi-recipient notifications
* Course publication notifications
* Enrollment notifications
* Chat event notifications
* Mark as read
* Mark all as read
* Soft deletion

## 9. Audit Logging

Important system actions are recorded through an audit log.

Each record can contain:

* Actor ID
* Actor name
* Actor role
* IP address
* Entity
* Action
* Previous value
* New value

JSON is used for storing old and new values where appropriate.

## 10. Lecturer Profiles

Lecturer profiles support:

* Specializations
* Professional experience
* Education
* Certificates
* Personal website
* LinkedIn profile
* Account activation/deactivation

---

# Database Structure

The database is organized into several functional groups.

```text
ACCOUNT & AUTHORIZATION
├── account
├── role
├── permission
├── account_permission
├── user
└── refresh_token

COURSE & CONTENT
├── course
├── category
├── chapter
├── course_resource
├── question
├── lesson_question
└── quiz_weight

LEARNING & ASSESSMENT
├── progress
├── quiz_attempt
├── review
└── wishlist

ORDERS
├── orders
└── order_item

CHAT
├── chat_conversation
├── chat_participant
└── chat_message

NOTIFICATION & AUDIT
├── notification
├── notification_recipient
└── audit_log

LECTURER & BLOG
├── lecturer_profile
├── lecturer_certificate
└── blog_post
```

## Important Enums

| Entity              | Field               | Values                                                                                  |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `account`           | `provider`          | `local`, `google`, `facebook`                                                           |
| `course`            | `status`            | `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `ARCHIVED`                                      |
| `course`            | `course_type`       | `LIVE`, `SELF_PACED`                                                                    |
| `course`            | `level`             | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ALL_LEVELS`                                    |
| `course`            | `progress_type`     | `COMPLETION_BASED`, `WEIGHTED_GRADE`                                                    |
| `course_resource`   | `resource_type`     | `VIDEO`, `QUIZ`, `PDF`, `SLIDE`, `AUDIO`, `DOCUMENT`, `IMAGE`, `LINK`, `SCORM`, `OTHER` |
| `question`          | `question_type`     | `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `SHORT_ANSWER`                        |
| `orders`            | `status`            | `PENDING`, `PAID`, `FAILED`, `CANCELLED`                                                |
| `order_item`        | `enrollment_type`   | `ENROLLED`, `WAITING`                                                                   |
| `order_item`        | `status`            | `ACTIVE`, `COMPLETED`, `DROPPED`, `ARCHIVED`                                            |
| `chat_conversation` | `conversation_type` | `PRIVATE`, `GROUP`, `COURSE`                                                            |

---

# Project Structure

## Backend

```text
src/main/java/org/wisdom/oc01/
├── config/
│   ├── SecurityConfiguration.java
│   ├── JwtFilter.java
│   ├── PermissionMappingFilter.java
│   ├── APIURL.java
│   └── WebSocketConfig.java
│
├── controller/
├── service/
│   ├── impl/
│   └── notification/
│
├── repository/
│   ├── projection/
│   └── quiz_assessment/
│
├── entity/
├── dto/
│   ├── request/
│   └── response/
│
├── generic/
│   ├── validator/
│   ├── mapper/
│   └── FileStorageService.java
│
├── exception/
│   ├── ErrorHandler.java
│   └── GlobalExceptionHandler.java
│
└── util/
```

## Frontend

```text
src/
├── components/
│   ├── elearning/
│   │   ├── layout/
│   │   ├── lesson/
│   │   ├── progress/
│   │   ├── course/
│   │   └── ui/
│   └── course/
│
├── pages/
│   ├── elearning/
│   │   ├── StudentPages/
│   │   ├── TeacherPages/
│   │   └── AdminPages/
│   └── course/
│
├── service/
│   ├── progress/
│   ├── auth/
│   ├── course/
│   └── ...
│
├── hooks/
├── types/
├── utils/
└── data/
```

---

# Installation & Setup

## Requirements

Make sure the following software is installed:

* Java 17+
* Node.js 18+
* MySQL 8.0+
* Maven 3.8+

## Backend Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd backend
```

### 2. Create the database

```bash
mysql -u root -p -e "CREATE DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Import database schema and seed data

```bash
mysql -u root -p test < database/dump.sql
```

### 4. Configure application properties

Update:

```text
src/main/resources/application.properties
```

Example:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# File upload
file.upload-dir=uploads
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB

# JWT
jwt.secret=your-super-secret-key-min-256-bits
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# VNPay
vnpay.tmn-code=YOUR_TMN_CODE
vnpay.hash-secret=YOUR_HASH_SECRET
vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url=http://localhost:8080/api/orders/vnpay/callback

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173

# Server
server.port=8080
```

### 5. Start the backend

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

# Frontend Setup

### 1. Navigate to the frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_UPLOAD_URL=http://localhost:8080/uploads
```

### 4. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Default Accounts

The project provides seed accounts for development and testing:

| Role    | Email                  | Username      | Password   |
| ------- | ---------------------- | ------------- | ---------- |
| ADMIN   | `admin@lsrc.edu`       | `admin`       | `password` |
| TEACHER | `instructor1@lsrc.edu` | `instructor1` | `password` |
| STUDENT | `student1@lsrc.edu`    | `student1`    | `password` |

> **Important:** Change all default passwords before deploying to production.

---

# API Overview

## Authentication

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| `POST` | `/api/auth/register`        | Register a new account |
| `POST` | `/api/auth/login`           | Login                  |
| `POST` | `/api/auth/refresh-token`   | Refresh access token   |
| `POST` | `/api/auth/forgot-password` | Send OTP               |
| `POST` | `/api/auth/reset-password`  | Reset password         |

## Courses

| Method   | Endpoint                   | Description           |
| -------- | -------------------------- | --------------------- |
| `GET`    | `/api/courses`             | Get paginated courses |
| `GET`    | `/api/courses/slug/{slug}` | Get course by slug    |
| `GET`    | `/api/courses/homepage`    | Get homepage courses  |
| `POST`   | `/api/courses`             | Create a course       |
| `PUT`    | `/api/courses/{id}`        | Update a course       |
| `DELETE` | `/api/courses/{id}`        | Soft-delete a course  |
| `POST`   | `/api/courses/{id}/clone`  | Clone a course        |

## Learning Progress

| Method | Endpoint                               | Description                 |
| ------ | -------------------------------------- | --------------------------- |
| `GET`  | `/api/progress/my-progress`            | Get current user's progress |
| `GET`  | `/api/progress/course/{id}`            | Get course progress         |
| `GET`  | `/api/progress/resource/{id}`          | Get resource progress       |
| `PUT`  | `/api/progress/resource/{id}`          | Update resource progress    |
| `PUT`  | `/api/progress/resource/{id}/complete` | Mark resource as completed  |

## Orders

| Method | Endpoint                  | Description       |
| ------ | ------------------------- | ----------------- |
| `POST` | `/api/orders`             | Create an order   |
| `POST` | `/api/orders/payment`     | Process payment   |
| `GET`  | `/api/orders/my-orders`   | Get user's orders |
| `PUT`  | `/api/orders/{id}/cancel` | Cancel an order   |

## Chat

| Method | Endpoint                                | Description           |
| ------ | --------------------------------------- | --------------------- |
| `GET`  | `/api/chat/conversations`               | List conversations    |
| `POST` | `/api/chat/conversations`               | Create a conversation |
| `GET`  | `/api/chat/conversations/{id}/messages` | Get messages          |
| `POST` | `/api/chat/conversations/{id}/messages` | Send a message        |
| `WS`   | `/ws`                                   | WebSocket endpoint    |

---

# Security

## Authentication Flow

```text
1. User submits login credentials
              ↓
2. Backend validates credentials
              ↓
3. Backend generates access + refresh tokens
              ↓
4. Client sends:
   Authorization: Bearer <access_token>
              ↓
5. JwtFilter validates the access token
              ↓
6. SecurityContext is populated
              ↓
7. PermissionMappingFilter checks permissions
              ↓
8. Controller handles the request
```

## Permission Model

Permissions follow a:

```text
RESOURCE:ACTION
```

pattern.

Examples:

```text
COURSE:READ
COURSE:CREATE
COURSE:UPDATE
COURSE:DELETE

QUESTION:READ
QUESTION:CREATE
QUESTION:UPDATE
QUESTION:DELETE
```

Default role permissions:

| Role      | Access                            |
| --------- | --------------------------------- |
| `ADMIN`   | Full system permissions           |
| `TEACHER` | Course and question management    |
| `STUDENT` | Learning content and own progress |

---

# Testing

## Backend

```bash
# Run all tests
mvn test

# Run a specific test
mvn test -Dtest=CourseServiceImplTest

# Run verification
mvn verify
```

## Frontend

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

---

# Deployment

## Backend

Build the application:

```bash
mvn clean package -DskipTests
```

Run the generated JAR:

```bash
java -jar target/oc01-1.0.0.jar \
  --spring.profiles.active=prod \
  --file.upload-dir=/var/lsrc/uploads
```

## Frontend

Build the production bundle:

```bash
npm run build
```

The generated files will be available in:

```text
dist/
```

## Nginx

Example configuration:

```nginx
server {
    listen 80;
    server_name lsrc.wisdombrain.org;

    location / {
        root /var/www/lsrc/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        alias /var/lsrc/uploads/;
    }

    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

# Known Issues & Fixes

| Issue                                     | Solution                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Video returns `404`                       | Configure `WebMvcConfig.addResourceHandlers` with the absolute upload path                          |
| `LazyInitializationException` on progress | Use `@EntityGraph`, reorder mapping/synchronization, and remove `clearAutomatically` where required |
| `useActiveLearners` returns `403`         | Use `getStudentsProgressByCourse` instead                                                           |
| Tab switching causes full page reload     | Use `setSearchParams(replace)` and lazy-mount tabs                                                  |
| Short video cannot be completed           | Add a tolerance period to video completion validation                                               |
| Free courses redirect to payment          | Handle free-course enrollment separately in order creation                                          |
| Video duration requires manual input      | Detect duration automatically from uploaded video metadata                                          |

---

# Roadmap

* [ ] Email verification during registration
* [ ] Certificate PDF generation
* [ ] Live streaming integration
* [ ] Mobile application with React Native
* [ ] Advanced analytics dashboard
* [ ] AI-powered course recommendations
* [ ] MoMo and ZaloPay integration
* [ ] Multi-language support (i18n)
* [ ] Elasticsearch-based search
* [ ] Course discussion forum

---

# License

Copyright © 2026 **LSRC**. All rights reserved.

---

# Contact

* **Website:** https://lsrc.wisdombrain.org
* **Email:** [contact@lsrc.edu](mailto:contact@lsrc.edu)
* **Partners:** Birmingham Academy, SHMS, DMU, Pearson Edexcel, OTHM

---

# Acknowledgements

* Spring Boot Community
* React Community
* VNPay Payment Gateway
* Birmingham Academy
* SHMS
* DMU
* Pearson Edexcel
* OTHM
