FROM openjdk:21
WORKDIR /home/dev
COPY ./target/api-gateway.jar .
EXPOSE 8085
CMD ["java","-jar","api-gateway.jar"]
