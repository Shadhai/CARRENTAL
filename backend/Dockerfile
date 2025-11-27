# === Build Stage ===
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven wrapper & config
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Download dependencies (cached)
RUN ./mvnw dependency:go-offline

# Copy source & build
COPY src src
RUN ./mvnw clean package -DskipTests

# === Runtime Stage ===
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy final JAR from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
