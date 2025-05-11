FROM openjdk:latest
WORKDIR ./target
RUN mvn package -DskipTests
COPY workflow-service.jar .
EXPOSE 8080
CMD["java","-jar","workflow-service.jar"]