package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.VaptResponse;
import com.dnsManagement.WorkFlowIpVaptService.models.Vapt;
import com.dnsManagement.WorkFlowIpVaptService.repo.VaptRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class VaptService {
    @Autowired
    private VaptRepo vaptRepo;


    public ResponseEntity<?> getVapt(@Positive Long vaptId) {
        Vapt vapt = vaptRepo.findById(vaptId).orElseThrow(()-> new NoSuchElementException("VAPT RECORD DOES NOT EXIST CORRESPONDING TO ID : "+vaptId));
        return new ResponseEntity<>(buildVaptResponse(vapt), HttpStatus.OK);

    }

    private VaptResponse buildVaptResponse(Vapt vapt) {
        VaptResponse vaptResponse = new VaptResponse();
        vaptResponse.setVapt_id(vapt.getVapt_id());
        vaptResponse.setIp_id(vapt.getIp_id().getIp_id());
        vaptResponse.setVapt_remarks(vapt.getVapt_remarks());
        vaptResponse.setVapt_certify_auth(vapt.getVapt_certify_auth());
        vaptResponse.set_active(vapt.is_active());
        vaptResponse.setExp_date(vapt.getExp_date());
        vaptResponse.setPrf_work(vaptResponse.getPrf_work());
        return vaptResponse;
    }

    public ResponseEntity<?> updateVapt(@Valid VaptResponse vaptResponse) {
        Vapt vapt = vaptRepo.findById(vaptResponse.getVapt_id()).orElseThrow(()-> new NoSuchElementException("VAPT RECORD DOES NOT EXIST CORRESPONDING TO ID : "+vaptResponse.getVapt_id()));

        vapt.setPrf_work(vaptResponse.getPrf_work());
        vapt.setVapt_remarks(vaptResponse.getVapt_remarks());
        vapt.set_active(vaptResponse.is_active());
        vapt.setVapt_certify_auth(vaptResponse.getVapt_certify_auth());
        vapt.setExp_date(vaptResponse.getExp_date());

        try{
            return new ResponseEntity<>(vaptRepo.save(vapt),HttpStatus.OK);

        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }

    }
}
