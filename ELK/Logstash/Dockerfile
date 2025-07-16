# Same version as the rest of the stack
FROM logstash:8.14.0

# Install the MongoDB output plugin
RUN logstash-plugin install logstash-output-mongodb

# COPY ./pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.confs