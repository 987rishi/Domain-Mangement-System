package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.IpResponse;
import com.dnsManagement.WorkFlowIpVaptService.models.Ip;
import com.dnsManagement.WorkFlowIpVaptService.repo.IpRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;

@Service
public class IpService {

    private final IpRepo ipRepo;

    @Autowired
    public IpService(IpRepo ipRepo) {
        this.ipRepo = ipRepo;
    }

    @Transactional
    public ResponseEntity<IpResponse> getIp(@Positive Long ipId) {
        Ip ip = ipRepo
                .findByIpId(ipId)
                .orElseThrow(()->
                        new NoSuchElementException(
                                "IP RECORD DOES NOT EXIST " +
                                        "CORRESPONDING TO THE ID: " + ipId));

        return new ResponseEntity<>(buildIpResponse(ip), HttpStatus.OK);

    }
    @Transactional
    public ResponseEntity<Ip> updateIp(@Valid IpResponse ipResponse) {
        Ip ip = ipRepo
                .findByIpId(
                        ipResponse
                                .getIpId())
                .orElseThrow(() ->
                        new NoSuchElementException("IP RECORD DOES" +
                        " NOT EXIST CORRESPONDING" +
                                " TO THE ID: " +
                                ipResponse
                                        .getIpId()));

        if(!Objects.equals(ip.getDomainName().getDomainNameId(), ipResponse.getDomainNameId()))
            throw new IllegalAccessError("DOMAIN ID DOES NOT" +
                    " MATCH WITH ACTUAL DOMAIN RECORD ID");

        ip.setExpiryDate(ipResponse.getExpiryDate());
        ip.setActive(ipResponse.isActive());
        ip.setIpAddress(ipResponse.getIpAddress());
        ip.setIpIssuer(ipResponse.getIpIssuer());

        return new ResponseEntity<>(ipRepo.save(ip),HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<List<Ip>> getAllIps() {
        return new ResponseEntity<>(ipRepo.findAll(),HttpStatus.OK);
    }


    private IpResponse buildIpResponse(Ip ip) {
        IpResponse ipResponse = new IpResponse();
        ipResponse.setIpId(ip.getIpId());
        ipResponse.setDomainNameId(
                ip.getDomainName()
                        .getDomainNameId());
        ipResponse.setIpIssuer(ip.getIpIssuer());
        ipResponse.setIpAddress(ip.getIpAddress());
        ipResponse.setExpiryDate(ip.getExpiryDate());
        ipResponse.setActive(ip.isActive());
        return ipResponse;
    }

    public ResponseEntity<String> isUnique(@NotNull String ipAddr) {
        Set<String> ipList =
                ipRepo.findAllIpAddress();
        if(!ipList.contains(ipAddr))
            return ResponseEntity.ok("IP ADDRESS IS VALID");
        return new ResponseEntity<>("The Ip Address you entered is not " +
                "Unique", HttpStatus.CONFLICT);

    }
}
