# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

# Cache dependency resolution separately from application source changes.
COPY pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests clean package \
    && JAR=$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' | head -n 1) \
    && test -n "$JAR" \
    && cp "$JAR" /workspace/app.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /workspace/app.jar /app/app.jar

USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
