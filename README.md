# MRCET College Sports Management System

A premium, full-stack College Sports Management System with role-based access control (Admin, Student, Coach), tournament fixtures scheduling, facility ground bookings, CSV reports export, and simulated AI features.

---

## Tech Stack
* **Frontend**: HTML5, CSS3 (Variables-based Light/Dark Mode), JavaScript (Single Page Application architecture), Bootstrap 5, Chart.js
* **Backend**: Java Spring Boot 3.3.0
* **Database**: MySQL 8.x
* **Security**: Custom JWT (JSON Web Token) role-based interception
* **AI Engine**: Simulated heuristics inside the service layer for Match Outcome Predictions, Performance Trends, and Chatbot Dialogue Parsing.

---

## Project Directory Structure
```text
collage-sport-management-system/
├── backend/
│   ├── .mvn/                      # Maven Wrapper configuration
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/collegesports/
│   │   │   │   ├── config/        # Interceptors & CORS Configurations
│   │   │   │   ├── controller/    # REST endpoints (Auth, Admin, Student, Coach, AI, Reports)
│   │   │   │   ├── model/         # JPA database entities (12+ tables)
│   │   │   │   ├── repository/    # JPA repositories interfaces
│   │   │   │   ├── security/      # JWT signers and security pre-handers
│   │   │   │   ├── service/       # Business services (AI heuristics, scheduling algorithms)
│   │   │   │   └── SystemApplication.java
│   │   │   └── resources/
│   │   │       ├── static/        # Static HTML/CSS/JS Single Page Frontend
│   │   │       │   ├── css/
│   │   │       │   │   └── styles.css
│   │   │       │   ├── js/
│   │   │       │   │   ├── api.js
│   │   │       │   │   ├── app.js
│   │   │       │   │   ├── charts.js
│   │   │       │   │   └── chatbot.js
│   │   │       │   └── index.html
│   │   │       └── application.properties # Database url & secrets
│   │   ├── pom.xml                # Maven configuration with JWT & BCrypt dependencies
│   │   ├── mvnw
│   │   └── mvnw.cmd
│   ├── database.sql               # Complete MySQL schema and mock seed data
│   └── README.md                  # Setup instructions
```

---

## Installation & Setup Instructions

### 1. Database Setup
1. Ensure your local MySQL server is running (usually on port `3306`).
2. Open your MySQL client (CLI, Workbench, or phpMyAdmin) and run the `database.sql` script located in the project root:
   ```sql
   SOURCE database.sql;
   ```
   This will automatically create the `college_sports_db` database, construct the 12 required tables, and seed them with initial mock users and matches.

### 2. Configure Backend Credentials
Edit the `backend/src/main/resources/application.properties` file if your database user or password differs from the default:
```properties
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 3. Build & Run the Backend
Navigate to the `backend` folder and run the Maven wrapper command to start the Spring Boot server:
* **Windows (PowerShell/CMD)**:
  ```powershell
  .\mvnw spring-boot:run
  ```
* **Linux/macOS**:
  ```bash
  chmod +x mvnw
  ./mvnw spring-boot:run
  ```

Once the application starts, it will listen on port `8080`.

### 4. Access the Application
Open your browser and navigate to:
```text
http://localhost:8080
```
The application serves the responsive single-page frontend directly from port `8080`, eliminating any CORS complications.

---

## Initial Seed Accounts for Testing
Use any of the following accounts to log into the portal (password for all is `password123`):

* **System Admin**:
  * Email: `admin@sports.college.edu`
  * Role: ADMIN (statistics, tournaments, sports CRUD, facility booking approvals)
* **Student Athlete**:
  * Email: `aarav.sharma@student.edu`
  * Role: STUDENT (profile editor, ground booking requestor, team enrollments, AI analytics charts)
* **Team Coach**:
  * Email: `vikram.coach@sports.college.edu`
  * Role: COACH (attendance records logs, match performance scorer, analytics dials)
