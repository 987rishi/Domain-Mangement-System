FROM openjdk:latest
WORKDIR /home/dev
RUN mvn package -DskipTests
COPY ./target/api-gateway.jar .
EXPOSE 8085
CMD["java","-jar","api-gateway.jar"]