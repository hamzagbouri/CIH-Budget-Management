# Use OpenJDK 17 slim variant for smaller image size
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy the JAR file from target directory
COPY target/*.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to spring user
USER spring

# Expose port 8080
EXPOSE 8080

# Set JVM options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 