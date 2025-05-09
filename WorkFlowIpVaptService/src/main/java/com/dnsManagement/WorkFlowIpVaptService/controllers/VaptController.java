package com.dnsManagement.WorkFlowIpVaptService.controllers;

import com.dnsManagement.WorkFlowIpVaptService.services.VaptService;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vapt")
public class VaptController {

  @Autowired
  private VaptService vaptService;

  @GetMapping("get-vapt/{hodId}")
  public ResponseEntity<?> getVaptRecordsByHodId(@PathVariable @Positive Long hodId) {
    return vaptService.findAllVaptRenewalRecords(hodId);
  }

  @GetMapping("vapt-view/detail/{vaptRenewalId}")
  public ResponseEntity<?> getVaptRenewalDetailDto(@PathVariable @Positive Long vaptRenewalId) {
    return vaptService.getVaptRenewalDetail(vaptRenewalId);
  }

}
