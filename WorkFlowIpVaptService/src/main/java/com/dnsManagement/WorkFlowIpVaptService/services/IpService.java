package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.IpResponse;
import com.dnsManagement.WorkFlowIpVaptService.models.Ip;
import com.dnsManagement.WorkFlowIpVaptService.repo.IpRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class IpService {

    @Autowired
    private IpRepo ipRepo;

    public ResponseEntity<?> getIp(@Positive Long ipId) {
        Ip ip = ipRepo.findByIpId(ipId).orElseThrow(()->new NoSuchElementException("IP RECORD DOES NOT EXIST CORRESPONDING TO THE ID: "+ipId));

        return new ResponseEntity<>(buildIpResponse(ip), HttpStatus.OK);

    }

    public ResponseEntity<?> updateIp(@Valid IpResponse ipResponse) {
        Ip ip = ipRepo.findByIpId(ipResponse.getIp_id()).orElseThrow(()->new NoSuchElementException("IP RECORD DOES NOT EXIST CORRESPONDING TO THE ID: "+ipResponse.getIp_id()));

        if(ip.getDm_id().getDm_id()!=ipResponse.getDm_id())
            throw new IllegalAccessError("DOMAIN ID DOES NOT MATCH WITH ACTUAL DOMAIN RECORD ID");

        ip.setExpiry_date(ipResponse.getExpiry_date());
        ip.set_active(ipResponse.is_active());
        ip.setIp_address(ipResponse.getIp_address());
        ip.setIp_issuer(ipResponse.getIp_issuer());

        try {
            return new ResponseEntity<>(ipRepo.save(ip),HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<List<?>> getAllIps() {
        return new ResponseEntity<>(ipRepo.findAll(),HttpStatus.OK);
    }

    private IpResponse buildIpResponse(Ip ip) {
        IpResponse ipResponse = new IpResponse();
        ipResponse.setIp_id(ip.getIp_id());
        ipResponse.setDm_id(ip.getDm_id().getDm_id());
        ipResponse.setIp_issuer(ip.getIp_issuer());
        ipResponse.setIp_address(ip.getIp_address());
        ipResponse.setExpiry_date(ip.getExpiry_date());
        ipResponse.set_active(ip.is_active());
        return ipResponse;
    }
}
