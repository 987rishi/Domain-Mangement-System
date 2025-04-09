package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.DomainPurchase;
import com.dnsManagement.WorkFlowIpVaptService.dto.NotificationWebhook;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.*;
import com.dnsManagement.WorkFlowIpVaptService.dto.WebMaster;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.NotificationClient;
import com.dnsManagement.WorkFlowIpVaptService.repo.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
public class PurchaseService {

    @Autowired
    private PurchasesRepo purchasesRepo;

    @Autowired
    private DomainNameRepo domainNameRepo;

    @Autowired
    private DomainVerificationRepo domainVerificationRepo;

    @Autowired
    private Utility utility;

    @Autowired
    private IpRepo ipRepo;

    @Autowired
    private VaptRepo vaptRepo;

    @Autowired
    private NotificationClient notificationClient;

    @Transactional
    public ResponseEntity<?> registerDomainPurchase(@Valid DomainPurchase domainPurchase) {
        //PERFORM VALIDATION TO CHECK IF DOMAIN NAME IS FINAL APPROVED BEFORE PURCHASE

        DomainVerification domainVerification = domainVerificationRepo.findByDomainNameId(domainPurchase.getDomainId()).orElseThrow(()-> new NoSuchElementException("GIVEN DOMAIN VERIFICATION RECORD DOES NOT EXIST WITH DOMAIN ID : "+ domainPurchase.getDomainId()));


        if(!domainVerification.is_verified())
            throw new IllegalStateException("DOMAIN HAS NOT BEEN VERIFIED YET WITH DOMAIN ID: "+domainPurchase.getDomainId());


        DomainName domainName = domainNameRepo.findById(domainPurchase.getDomainId()).orElseThrow(()-> new NoSuchElementException("THE GIVEN DOMAIN WITH DOES NOT EXIST WITH ID: " + domainPurchase.getDomainId()));

        WebMaster webMaster = utility.findOrThrowNoSuchElementException("WEBMASTER", WebMaster.class,domainPurchase.getWebMasterId());

        Purchases purchases = new Purchases();

        purchases.setDt_of_purchase(domainPurchase.getDateOfPurchase());

        purchases.setWbmstr_id(webMaster.getEmp_no());

        purchases.setPrf_of_purchase(domainPurchase.getProofOfWork());

        purchases.setDomainName(domainName);

        purchases.setPurchaseType(domainPurchase.getPurchaseType());


        domainName.setExpiry_date(domainPurchase.getDomainExpiryDate());
        domainName.setD_o_act(LocalDateTime.now());
        domainName.setPeriod(domainPurchase.getFinalPeriod());
        domainName.set_active(true);

        Ip ip = ipRepo.findByDomainId(domainName.getDm_id()).orElseThrow(()->new NoSuchElementException("IP CORRESPONDING TO DOMAIN DOES NOT EXIST WITH ID "+domainName.getDm_id()));
        Vapt vapt = vaptRepo.findByIpId(ip.getIp_id()).orElseThrow(()->new NoSuchElementException("VAPT CORRESPONDING TO IP DOES NOT EXIST WITH ID "+ip.getIp_id()));

        if(ip.getExpiry_date()==null || vapt.getExp_date()==null)
            throw new IllegalStateException("EXPIRY DATE OF IP AND VAPT CANNOT BE NULL DURING DOMAIN NAME PURCHASE");

        ip.set_active(true);
        vapt.set_active(true);


        try{
            domainNameRepo.save(domainName);
            vaptRepo.save(vapt);
            ipRepo.save(ip);
            notificationClient.sendNotification(buildNotification(domainName));

            return new ResponseEntity<>(purchasesRepo.save(purchases), HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("ERROR OCCURED WHILE SAVING DOMAIN PURCHASE :"+e.getMessage());
        }
    }
    private NotificationWebhook buildNotification(DomainName domainName) {

        String remarks = "DOMAIN NAME IS APPLICATION HAS BEEN SUCCESSFULLY COMPLETED AND IS NOW AVAILABLE FOR USE.";
        NotificationWebhook.EventType eventType = NotificationWebhook.EventType.DOMAIN_ACTIVATED;
        Role role = Role.WEBMASTER;

        return new NotificationWebhook(
                eventType,
                LocalDateTime.now(),
                new NotificationWebhook.TriggeredBy(
                        domainName.getWebmaster_emp_no(),
                        role
                ),
                new NotificationWebhook.NotificationData(
                        domainName.getDm_id(),
                        domainName.getDm_name(),
                        remarks
                ),
                new NotificationWebhook.Recipients(
                        domainName.getDrm_emp_no(),
                        domainName.getArm_emp_no()
                )
        );
    }
}
