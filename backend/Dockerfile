# Use official JDK 21 image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy Maven files first to leverage caching
COPY pom.xml .
COPY src ./src

# Build the Spring Boot app
RUN ./mvnw clean package -DskipTests || mvn clean package -DskipTests

# Expose the port Railway will use
ENV PORT $PORT
EXPOSE $PORT

# Run the Spring Boot jar
CMD ["java","-jar","target/sat-tracker-backend-0.0.1-SNAPSHOT.jar"]
