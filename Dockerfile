# Stage 1: Build the Angular Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy frontend config and source code
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot Backend with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app

# Copy the backend pom.xml and source code
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src

# Copy the compiled static assets from Stage 1 into the backend resources static folder
COPY --from=frontend-build /app/backend/src/main/resources/static /app/backend/src/main/resources/static

WORKDIR /app/backend
# Build the JAR file, skipping test runs
RUN mvn clean package -DskipTests

# Stage 3: Run the jar file in a JRE runtime container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Expose the server port
EXPOSE 8080

# Run the spring-boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
