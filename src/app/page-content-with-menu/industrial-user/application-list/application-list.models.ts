// src/app/application-list/application-list.models.ts

// Model for the API response structure
export interface ApiResponse {
  status: string;
  status_code: string;
  status_message: string;
  result: ApplicationData[];
  total_rows: string;
  current_page: string;
  loggedin_uid: string;
}

// Model for individual application data from the API
export interface ApplicationData {
  nocDetailsId: string;
  noc_master_id: string;
  nocMasterId: string;
  applicationNumber: string;
  download_estimate: string;
  download_noc: string;
  download_rejection: string;
  applicationDate: string; // Format: "YYYY-MM-DD"
  applicationFor: string;
  departmentName: string;
  applicationType: string; // e.g., "cfo", "other"
  status: string;
  renewalDate: string;
  dueDate: string; // Format: "YYYY-MM-DD" or empty
  payment_status: string;
  has_form: string; // "1" or "0" as string
  extraPaymentAmount: string;
}

// Model for filter options (if needed from API or static)
export interface FilterOptions {
  departments: { value: string; label: string }[];
  applicationTypes: { value: string; label: string }[];
}

// Interface for the filter form values
export interface ApplicationFilters {
  from_dt: string; // Date string or empty
  to_dt: string; // Date string or empty
  department: string;
  applicationType: string;
}
