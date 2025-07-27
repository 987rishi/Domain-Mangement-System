ziti edge create identity gateway.client -a 'gateway.client' -o gateway.client.jwt
ziti edge create identity workflow.client -a 'workflow.client' -o workflow.client.jwt
ziti edge create identity renewal.client -a 'renewal.client' -o renewal.client.jwt
ziti edge create identity usermanagement.client -a 'usermanagement.client' -o usermanagement.client.jwt
ziti edge create identity notification.client -a 'notification.client' -o notification.client.jwt
     

#2. Create an identity for the HTTP server if you are not using an edge-router with the tunneling option enabled
ziti edge create identity registry.server -o registry.server.jwt

#3. Create an intercept.v1 config. This config is used to instruct the client-side tunneler how to correctly intercept 
#   the targeted traffic and put it onto the overlay. 
ziti edge create config gateway.intercept.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["registry.ziti"], "portRanges":[{"low":8761, "high":8761}]}'

ziti edge create config workflow.intercept.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["workflow.ziti"], "portRanges":[{"low":8080, "high":8080}]}'
ziti edge create config workflow.db.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["workflow.db.ziti"], "portRanges":[{"low":5432, "high":5432}]}'



ziti edge create config renewal.intercept.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["renewal.ziti"], "portRanges":[{"low":5000, "high":5000}]}'
ziti edge create config renewal.db.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["renewal.db.ziti"], "portRanges":[{"low":5432, "high":5432}]}'


ziti edge create config usermanagement.intercept.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["usermgmt.ziti"], "portRanges":[{"low":5000, "high":5000}]}'
ziti edge create config usermanagement.db.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["user-management.db.ziti"], "portRanges":[{"low":5432, "high":5432}]}'
ziti edge create config ldap.intercept.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["ldap.ziti"], "portRanges":[{"low":389, "high":389}]}'


ziti edge create config notification.intercept.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["notification.ziti"], "portRanges":[{"low":5000, "high":5000}]}'
ziti edge create config notification.db.v1 intercept.v1 '{"protocols":["tcp"],"addresses":["notification.db.ziti"], "portRanges":[{"low":5432, "high":5432}]}'


#4. Create a host.v1 config. This config is used instruct the server-side tunneler how to offload the traffic from 
#   the overlay, back to the underlay. Make sure the port used here is correct. For example, when running inside a 
#   docker container, the ${http_server} variable would likely be set to web.test.blue but the port for the http server
#   inside the container is listening on 8000, not 80. Be careful with the port and make sure the ${http_server}:port
#   is reachable from the ${http_server_id}.  

ziti edge create config registry.host.v1 host.v1 '{"protocol":"tcp", "address":"service-registry", "port":8761}'
ziti edge create config workflow.host.v1 host.v1 '{"protocol":"tcp", "address":"workflow-service", "port":8080}'
ziti edge create config usermanagement.host.v1 host.v1 '{"protocol":"tcp", "address":"user-management-service", "port":5000}'
ziti edge create config renewal.host.v1 host.v1 '{"protocol":"tcp", "address":"renewal-service", "port":5000}'
ziti edge create config notification.host.v1 host.v1 '{"protocol":"tcp", "address":"notification-service", "port":5000}'
ziti edge create config notification.db.host.v1 host.v1 '{"protocol":"tcp", "address":"notification-service-db", "port":5432}'
ziti edge create config renewal.db.host.v1 host.v1 '{"protocol":"tcp", "address":"renewal-service-db", "port":5432}'
ziti edge create config usermanagement.db.host.v1 host.v1 '{"protocol":"tcp", "address":"user-management-service-db", "port":5432}'
ziti edge create config workflow.db.host.v1 host.v1 '{"protocol":"tcp", "address":"workflow-service-db", "port":5432}'
ziti edge create config openldap.host.v1 host.v1 '{"protocol":"tcp", "address":"openldap", "port":389}'



#5. Create a service to associate the two configs created previously into a service.
ziti edge create service registry.svc --configs gateway.intercept.v1,registry.host.v1

ziti edge create service workflow.svc --configs workflow.intercept.v1,workflow.host.v1

ziti edge create service usermanagement.svc --configs usermanagement.intercept.v1,usermanagement.host.v1

ziti edge create service renewal.svc --configs renewal.intercept.v1,renewal.host.v1

ziti edge create service notification.svc --configs notification.intercept.v1,notification.host.v1

ziti edge create service openldap.svc --configs ldap.intercept.v1,openldap.host.v1

ziti edge create service notification.db.svc --configs notification.db.v1,notification.db.host.v1

ziti edge create service renewal.db.svc --configs renewal.db.v1,renewal.db.host.v1

ziti edge create service usermanagement.db.svc --configs usermanagement.db.v1,usermanagement.db.host.v1

ziti edge create service workflow.db.svc --configs workflow.db.v1,workflow.db.host.v1




#6. Create a service-policy to authorize "HTTP Clients" to "dial" the service representing the HTTP server.
ziti edge create service-policy services.policy.dial Dial --service-roles "@registry.svc" --identity-roles '#gateway.client,#workflow.client,#renewal.client,#notification.client,#usermanagement.client'

ziti edge create service-policy workflow.renewal.policy.dial Dial --service-roles "@workflow.svc" --identity-roles '#renewal.client'

ziti edge create service-policy renewal.workflow.policy.dial Dial --service-roles "@renewal.svc" --identity-roles '#workflow.client'

ziti edge create service-policy user.renewal.policy.dial Dial --service-roles "@usermanagement.svc" --identity-roles '#renewal.client'

ziti edge create service-policy user.workflow.policy.dial Dial --service-roles "@usermanagement.svc" --identity-roles '#workflow.client'

ziti edge create service-policy notification.policy.dial Dial --service-roles "@notification.svc" --identity-roles '#workflow.client,#renewal.client,#usermanagement.client'




ziti edge create service-policy workflow.db.policy.dial Dial --service-roles "@workflow.db.svc" --identity-roles '#workflow.client'

ziti edge create service-policy renewal.db.policy.dial Dial --service-roles "@renewal.db.svc" --identity-roles '#renewal.client'

ziti edge create service-policy usermanagement.db.policy.dial Dial --service-roles "@usermanagement.db.svc" --identity-roles '#usermanagement.client'

ziti edge create service-policy notification.db.policy.dial Dial --service-roles "@notification.db.svc" --identity-roles '#notification.client'

ziti edge create service-policy openldap.policy.dial Dial --service-roles "@openldap.svc" --identity-roles '#usermanagement.client'



#7. Create a service-policy to authorize the "HTTP Server" to "bind" the service representing the HTTP server.
ziti edge create service-policy registry.policy.bind Bind --service-roles '@registry.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy workflow.policy.bind Bind --service-roles '@workflow.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy renewal.policy.bind Bind --service-roles '@renewal.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy usermanagement.policy.bind Bind --service-roles '@usermanagement.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy notification.policy.bind Bind --service-roles '@notification.svc' --identity-roles "@ziti-edge-router"


ziti edge create service-policy notification.db.policy.bind Bind --service-roles '@notification.db.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy workflow.db.policy.bind Bind --service-roles '@workflow.db.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy renewal.db.policy.bind Bind --service-roles '@renewal.db.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy usermanagement.db.policy.bind Bind --service-roles '@usermanagement.db.svc' --identity-roles "@ziti-edge-router"

ziti edge create service-policy openldap.policy.bind Bind --service-roles '@openldap.svc' --identity-roles "@ziti-edge-router"


#8. Create an edge-router-policy to grant all routers access to all identities.
ziti edge create edge-router-policy "all-routers-all-identities" --edge-router-roles '#all' --identity-roles '#all'

#9. Create a service-edge-router-policy to grant all routers access to all services.
ziti edge create service-edge-router-policy "all-routers-all-services" --edge-router-roles '#all' --service-roles '#all'