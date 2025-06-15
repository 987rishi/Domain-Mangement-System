package com.dnsManagement.WorkFlowIpVaptService.services;

import com.dnsManagement.WorkFlowIpVaptService.dto.Arm;
import com.dnsManagement.WorkFlowIpVaptService.dto.Drm;
import com.dnsManagement.WorkFlowIpVaptService.helpers.Utility;
import com.dnsManagement.WorkFlowIpVaptService.models.DomainName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

  private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

  @Autowired
  private JavaMailSender javaMailSender;

  @Value("${notification.sender.email}")
  private String senderEmail;

  @Value("${notification.subject.prefix}")
  private String mailSubject;

  @Autowired
  private Utility utility;


  public void sendExpirationWarningEmail(DomainName domain,
                                         int daysUntilExpiration) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(senderEmail);

      Drm drm = utility.findOrThrowNoSuchElementException("DRM", Drm.class,
              domain.getDrmEmployeeNumber());
      Arm arm = utility.findOrThrowNoSuchElementException("ARM", Arm.class,
              domain.getArmEmployeeNumber());

      String subjectMessage;
      String bodyMessage;

      message.setTo(drm.getEmail());
      message.setCc(arm.getEmail());

      if(daysUntilExpiration != 0)
        subjectMessage = String.format("%s Your domain %s is expiring " +
                      "in %d days",
              mailSubject, domain.getDomainName(), daysUntilExpiration);
      else
        subjectMessage = String.format("%s Your domain %s has expired ",
                mailSubject, domain.getDomainName());



      message.setSubject(subjectMessage);
      message.setText(String.format(
              "Dear User,\n\n" +
                      "This is a friendly reminder that your domain '%s' is due to expire in %d days, on %s.\n\n" +
                      "Please take the necessary steps to renew it to avoid any service interruption.\n\n" +
                      "Regards,\n" +
                      "Your Domain Management Team",
              domain.getDomainName(), daysUntilExpiration, domain.getExpiryDate().toString()
      ));

      javaMailSender.send(message);
      logger.info("Expiration warning email sent to {} for domain {} ({} days).",
              drm.getEmail(), domain.getDomainName(), daysUntilExpiration);

    } catch (MailException e) {
      logger.error("Error sending expiration email for domain {}: {}", domain.getDomainName(), e.getMessage());
      // Consider adding more robust error handling, like putting it in a retry queue
    }
  }
}
