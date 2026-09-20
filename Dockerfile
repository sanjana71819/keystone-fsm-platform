# Multi-stage build for Spring Boot Java 17 application from repository root
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=dev
ENV JWT_SECRET=S3cr3tK3yst0n3FSM_ChangeThisInProductionUseAtLeast32Chars!

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
