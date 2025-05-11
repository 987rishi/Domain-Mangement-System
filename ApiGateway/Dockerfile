FROM openjdk:latest
WORKDIR ./target
RUN mvn package -DskipTests
COPY api-gateway.jar .
EXPOSE 8085
CMD["java","-jar","api-gateway.jar"]