// models/inspection.models.ts
export interface Department {
  id: string;
  name: string;
}

export interface Inspection {
  id: string;
  inspection_id: string;
  inspection_date: string; // ISO date string
  department_type: string;
  inspection_type: string;
  inspection_for: string;
  departmentId: string;
  department: string;
  status: string;
  inspector: string;
  download_report: string;
  targetComplianceDate: string;
  targetShowCauseDate: string;
  download_compliance_report: string;
  download_show_cause_notice: string;
  download_show_cause_reply: string;
  download_legal_notice: string;
  // ... other properties from API response
}

export interface InspectionRequest {
  id: string;
  RequestId: string;
  ProposedDate: string; // ISO date string
  InspectionType: string;
  InspectionFor: string;
  IndustryName: string;
  IndustryId: string;
  unique_no: string;
  RequestedBy: string;
  deptId: string;
  deptName: string;
  status: string;
  remarks: string | null;
  inspector: string;
  // ... other properties from API response
}

// Response structure (if you want to type the full API response)
export interface ApiResponse<T> {
  status: string;
  status_code: string;
  status_message: string;
  total_rows?: string; // Optional for lists
  current_page?: string; // Optional for lists
  result: T;
}
