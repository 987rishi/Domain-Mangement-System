FROM openjdk:latest
WORKDIR /home/dev
RUN mvn package -DskipTests
COPY ./target/service-registry.jar .
EXPOSE 8761
CMD["java","-jar","service-registry.jar"]
