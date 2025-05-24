export interface TransferResponse {
    tt_id: string;           // Unique identifier for transfer records
    dm_id: string;           // Foreign key referencing DomainNameList.dm_id
    trns_frm: string;        // Foreign key referencing DrmList.emp_no (initiator)
    trns_to: string;         // Foreign key referencing DrmList.emp_no (receiver)
    created_at:  Date;      // Date of transfer event, nullable
    updated_at:  Date ;
    approved_at: Date | null;
    rsn_for_trns: string;    // Reason for the transfer, required
    prf_upload: string;      // Proof of transfer approval stored as binary data
    hod_approved: boolean;   // Indicates whether HOD approved the transfer
  }

  export interface Pdf {
    prf_upload: string; 
  }