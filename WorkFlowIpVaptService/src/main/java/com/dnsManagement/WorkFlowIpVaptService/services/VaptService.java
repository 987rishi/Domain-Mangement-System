package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.*;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.models.Vapt;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.StakeHolderClient;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.VaptAndIpRenewalsClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.DomainNameRepo;
import com.dnsManagement.WorkFlowIpVaptService.repo.VaptRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class VaptService {
    @Autowired
    private VaptRepo vaptRepo;

    @Autowired
    private StakeHolderClient client;

    @Autowired
    private VaptAndIpRenewalsClient renewalsClient;

    @Autowired
    private DomainNameRepo domainNameRepo;

    @Autowired
    private Utility utility;


    @Transactional
    public ResponseEntity<?> getVapt(@Positive Long vaptId) {
        Vapt vapt = vaptRepo
                .findById(vaptId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "VAPT RECORD " +
                                        "DOES NOT EXIST " +
                                        "CORRESPONDING TO ID : " + vaptId));
        return new ResponseEntity<>(buildVaptResponse(vapt), HttpStatus.OK);

    }

    private VaptResponse buildVaptResponse(Vapt vapt) {
        VaptResponse vaptResponse = new VaptResponse();
        vaptResponse.setVaptId(vapt.getVaptId());
        vaptResponse.setIpId(vapt.getIp().getIpId());
        vaptResponse.setVaptRemarks(vapt.getVaptRemarks());
        vaptResponse.setVaptCertifyAuthority(vapt.getVaptCertifyAuthority());
        vaptResponse.setActive(vapt.isActive());
        vaptResponse.setExpiryDate(vapt.getExpiryDate());
        vaptResponse.setProofWork(vaptResponse.getProofWork());
        return vaptResponse;
    }

    @Transactional
    public ResponseEntity<?> updateVapt(@Valid VaptResponse vaptResponse) {
        Vapt vapt = vaptRepo
                .findById(
                        vaptResponse
                                .getVaptId())
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "VAPT RECORD " +
                        "DOES NOT EXIST CORRESPONDING TO ID : " +
                                        vaptResponse.getVaptId()));

        vapt.setProofOfWork(vaptResponse.getProofWork());
        vapt.setVaptRemarks(vaptResponse.getVaptRemarks());
        vapt.setActive(vaptResponse.isActive());
        vapt.setVaptCertifyAuthority(vaptResponse.getVaptCertifyAuthority());
        vapt.setExpiryDate(vaptResponse.getExpiryDate());

        try{
            return new ResponseEntity<>(vaptRepo.save(vapt),HttpStatus.OK);

        } catch (Exception e) {
            throw new RuntimeException("ERROR WHILE UPDATING VAPT. " +
                    e.getMessage());
        }

    }

    public ResponseEntity<?> findAllVaptRenewalRecords(@Positive Long hodId) {

        List<VaptRenewalResponseDTO> vaptRenewals =
                renewalsClient
                        .fetchVaptRenewalsByRoleAndEmpNo(hodId, Role.HOD);

        List<VaptViewDto> vaptList = new ArrayList<>();

        for(VaptRenewalResponseDTO vapt : vaptRenewals) {
            DomainName domainName = domainNameRepo
                    .findById(Long.parseLong(vapt.getDomainId()))
                    .orElseThrow(() ->
                            new NoSuchElementException("" +
                                    "Domain name does not exist with id: " +
                                    vapt.getDomainId()));


            Vapt vaptRecord = vaptRepo
                    .findById(Long
                            .parseLong(vapt
                                    .getVaptId()))
                    .orElseThrow(() ->
                            new NoSuchElementException("" +
                                    "Vapt record does not exist with id: " +
                                    vapt.getVaptId()));
            Drm drm = utility.findOrThrowNoSuchElementException(
                    "DRM",
                    Drm.class,
                    domainName.getDrmEmployeeNumber());

            Arm arm = utility.findOrThrowNoSuchElementException(
                    "ARM",
                    Arm.class,
                    domainName.getArmEmployeeNumber());


            VaptViewDto viewDto = new VaptViewDto();
            viewDto.setVaptId(Long.parseLong(vapt.getVaptId()));
            viewDto.setDomainId(Long.parseLong(vapt.getDomainId()));
            viewDto.setDomainName(domainName.getDomainName());
            viewDto.setVaptExpiryDate(vaptRecord.getExpiryDate().toLocalDate());
            viewDto.setDrmName(drm.getFirstName() + " " + drm.getLastName());
            viewDto.setArmName((arm.getFirstName() + " " + arm.getLastName()));
            viewDto.setVaptRenewalId(Long.parseLong(vapt.getVaptRenewalId()));

            vaptList.add(viewDto);

        }

        return new ResponseEntity<>(vaptList,HttpStatus.OK);
    }

    public ResponseEntity<?> getVaptRenewalDetail(@Positive Long vaptRenewalId) {

        VaptRenewalDetailDto vaptRenewalDetailDto = new VaptRenewalDetailDto();
        VaptRenewalResponseDTO vaptRenewalResponse =
                renewalsClient
                        .fetchVaptRenewalByRenewalId(vaptRenewalId);

        Drm drm = utility.findOrThrowNoSuchElementException(
                "DRM",
                Drm.class,
                Long.parseLong(vaptRenewalResponse.getDrmEmpNoInitiator()));

        Arm arm = utility.findOrThrowNoSuchElementException(
                "ARM",
                Arm.class,
                Long.parseLong(vaptRenewalResponse.getDrmEmpNoInitiator()));


        Centre armCentre = utility
                .findCentreOrThrowNoSuchElementException(
                        Centre.class,
                        arm.getCentreId());

        Centre drmCentre = utility
                .findCentreOrThrowNoSuchElementException(
                        Centre.class,
                        drm.getCentreId());

        DomainName domainName =
                domainNameRepo.findByDomainNameId(
                        Long.parseLong(vaptRenewalResponse.getDomainId()))
                        .orElseThrow(() ->
                                        new NoSuchElementException(
                                                "DOMAIN NAME " +
                                                        "DOES NOT EXIST CORRESPONDING TO ID : " +
                                                        vaptRenewalResponse.getDomainId()));






        vaptRenewalDetailDto.setArmName(arm.getFirstName() + " " + arm.getLastName());
        vaptRenewalDetailDto.setArmEmail(arm.getEmail());
        vaptRenewalDetailDto.setArmMobileNo(arm.getMobileNumber());
        vaptRenewalDetailDto.setArmCentre(armCentre.getCentreName());

        vaptRenewalDetailDto.setDrmCentre(drmCentre.getCentreName());
        vaptRenewalDetailDto.setDrmName(drm.getFirstName() + " " + drm.getLastName());
        vaptRenewalDetailDto.setDrmEmail(drm.getEmail());
        vaptRenewalDetailDto.setDrmMobileNo(drm.getMobileNumber());

        vaptRenewalDetailDto.setVaptRenewalId(vaptRenewalResponse
                .getVaptRenewalId());

        vaptRenewalDetailDto.setNewVaptReport(vaptRenewalResponse.getNewVaptReport());
        vaptRenewalDetailDto.setOldVaptReport(vaptRenewalResponse.getOldVaptReport());
        vaptRenewalDetailDto.setCreatedAt(vaptRenewalResponse.getCreatedAt());
        vaptRenewalDetailDto.setDomainName(domainName.getDomainName());
        vaptRenewalDetailDto.setStatus(vaptRenewalResponse.getStatus());
        vaptRenewalDetailDto.setNewVaptExpiryDate(vaptRenewalResponse.getNewVaptExpiryDate());

        return new ResponseEntity<>(vaptRenewalDetailDto,HttpStatus.OK);

    }
}
