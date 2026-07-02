# Stage 1: Build the Spring Boot application with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application jar package, skipping test runs
RUN mvn clean package -DskipTests

# Stage 2: Run the packaged jar in a slim JRE container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the server port
EXPOSE 8080

# Run the spring-boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
