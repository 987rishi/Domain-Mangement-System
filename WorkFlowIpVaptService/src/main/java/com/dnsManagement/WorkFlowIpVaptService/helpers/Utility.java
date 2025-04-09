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
    public static boolean verifyIfVerifiedByPrevAuth(Role prevAuth, Role auth, DomainVerification dv) {
        int currentIndex = VERIFICATION_ORDER.indexOf(auth);
        int prevIndex = VERIFICATION_ORDER.indexOf(prevAuth);

        // Ensure the roles are valid and current role is just after the previous role
        if (currentIndex == -1 || prevIndex == -1 || currentIndex - prevIndex != 1) {
            return false;
        }

        // Check verification status based on role
        return switch (auth) {
            case HOD -> dv.isFwd_arm() && !dv.isVfyd_by_hod();
            case ED -> dv.isVfyd_by_hod() && !dv.isVfy_by_ed();
            case NETOPS -> dv.isVfy_by_ed() && !dv.isVfy_by_netops();
            case WEBMASTER -> dv.isVfy_by_netops() && !dv.isVfy_by_wbmstr();
            case HODHPC -> dv.isVfy_by_wbmstr() && !dv.isVfy_by_hod_hpc_iand_e();
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
                case HOD -> !dv.isSnt_bk_by_hod();
                case ED -> !dv.isSnt_bk_by_hod() && !dv.isSnt_bk_by_ed();
                case NETOPS -> !dv.isSnt_bk_by_ed() && !dv.isSnt_bk_by_netops();
                case WEBMASTER -> !dv.isSnt_bk_by_netops() && !dv.isSnt_bk_by_wbmstr();
                case HODHPC -> !dv.isSnt_bk_by_wbmstr() && !dv.isSnt_bk_by_hpc();
                default -> false;
            };

    }

}
