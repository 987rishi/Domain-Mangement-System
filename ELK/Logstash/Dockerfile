# Same version as the rest of the stack
FROM logstash:8.14.0

# Install the MongoDB output plugin
RUN logstash-plugin install logstash-output-mongodb

# Create the all logs directory and make the logstash user the ownerd
RUN mkdir -p /usr/share/logstash/archived-logs && \
    chown -R logstash:logstash /usr/share/logstash/archived-logs

# COPY ./pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.confs