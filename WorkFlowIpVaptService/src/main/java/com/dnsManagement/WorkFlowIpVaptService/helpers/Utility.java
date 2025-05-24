package com.dnsManagement.WorkFlowIpVaptService.helpers;

import com.dnsManagement.WorkFlowIpVaptService.models.DomainVerification;
import com.dnsManagement.WorkFlowIpVaptService.models.Role;
import com.dnsManagement.WorkFlowIpVaptService.openfeign.StakeHolderClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.NoSuchElementException;

@Component
public final class Utility {

    // Chain of verification in order
    private static final List<Role> VERIFICATION_ORDER = List.of(Role.ARM, Role.HOD, Role.ED, Role.NETOPS,Role.WEBMASTER,Role.HODHPC);

    @Autowired
    private StakeHolderClient stakeHolderClient;

    @Autowired
    private ObjectMapper objectMapper;


    public <T> T findOrThrowNoSuchElementException(String role,Class<T> tClass, Long searchKey){
        Object object = stakeHolderClient.fetchStakeHolderDetails(role,searchKey); //SERVICE DISCOVERY USING OPEN FEIGN

        if(object == null) throw new NoSuchElementException(String.format("GIVEN %s DOES NOT EXIST WITH ID :%d",role,searchKey));

        T stakeHolder = objectMapper.convertValue(object,tClass); // CONVERTS OUR RAW OBJECT (DESERILIZED JSON) INTO A CLASS OBJECT USING JACKSON
        return stakeHolder;
    }
    public <T> T findGroupOrThrowNoSuchElementException(
                                                     Class<T> tClass,
                                                Long searchKey){
        Object object = stakeHolderClient.fetchDepartmentDetails(searchKey);
        //SERVICE DISCOVERY USING OPEN FEIGN

        if(object == null) throw new NoSuchElementException(String.format(
                "GIVEN DEPARTMENT DOES NOT EXIST WITH ID :%d",searchKey));

        T stakeHolder = objectMapper.convertValue(object,tClass); // CONVERTS OUR RAW OBJECT (DESERILIZED JSON) INTO A CLASS OBJECT USING JACKSON
        return stakeHolder;
    }

    public <T> T findCentreOrThrowNoSuchElementException(
            Class<T> tClass,
            Long searchKey){
        Object object = stakeHolderClient.fetchCentreDetails(searchKey);
        //SERVICE DISCOVERY USING OPEN FEIGN

        if(object == null) throw new NoSuchElementException(String.format(
                "GIVEN CENTRE DOES NOT EXIST WITH ID :%d",searchKey));

        T stakeHolder = objectMapper.convertValue(object,tClass); // CONVERTS OUR RAW OBJECT (DESERILIZED JSON) INTO A CLASS OBJECT USING JACKSON
        return stakeHolder;
    }

    public static boolean verifyIfVerifiedByPrevAuth(Role prevAuth, Role auth, DomainVerification dv) {
        int currentIndex = VERIFICATION_ORDER.indexOf(auth);
        int prevIndex = VERIFICATION_ORDER.indexOf(prevAuth);

        // Ensure the roles are valid and current role is just after the previous role
        if (currentIndex == -1 || prevIndex == -1 || currentIndex - prevIndex != 1) {
            return false;
        }

        // Check verification status based on role
        return switch (auth) {
            case HOD -> dv.isForwardedToArm() && !dv.isVerifiedByHod();
            case ED -> dv.isVerifiedByHod() && !dv.isVerifiedByEd();
            case NETOPS -> dv.isVerifiedByEd() && !dv.isVerifiedByNetops();
            case WEBMASTER -> dv.isVerifiedByNetops() && !dv.isVerifiedByWebmaster();
            case HODHPC -> dv.isVerifiedByWebmaster() && !dv.isVerifiedByHodHpcIandE();
            default -> false;
        };
    }

        public static boolean verifyIfSentByPrevAuth(Role prevAuth, Role auth, DomainVerification dv){
            int currentIndex = VERIFICATION_ORDER.indexOf(auth);
            int prevIndex = VERIFICATION_ORDER.indexOf(prevAuth);

            // Ensure the roles are valid and current role is just after the previous role
            if (currentIndex == -1 || prevIndex == -1 || currentIndex - prevIndex != 1) {
                return false;
            }

            // Check verification status based on role
            return switch (auth) {
                case HOD -> !dv.isSentBackByHod();
                case ED -> !dv.isSentBackByHod() && !dv.isSentBackByEd();
                case NETOPS -> !dv.isSentBackByEd() && !dv.isSentBackByNetops();
                case WEBMASTER -> !dv.isSentBackByNetops() && !dv.isSentBackByWebmaster();
                case HODHPC -> !dv.isSentBackByWebmaster() && !dv.isSentBackByHpc();
                default -> false;
            };

    }

}
