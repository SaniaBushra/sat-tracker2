FROM eclipse-temurin:21-jdk

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

ENV PORT $PORT
EXPOSE $PORT

CMD ["java","-jar","target/sat-tracker-backend-0.0.1-SNAPSHOT.jar"]
