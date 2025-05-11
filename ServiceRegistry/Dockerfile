FROM openjdk:latest
WORKDIR ./target
RUN mvn package -DskipTests
COPY service-registry.jar .
EXPOSE 8761
CMD["java","-jar","service-registry.jar"]
