export interface RegistrationData {
  name_of_enterprise: string;
  authorized_person_name: string;
  email_id: string;
  mobile_no: string;
  user_name: string;
  registered_enterprise_address: string;
  registered_enterprise_city: string;
  user_type: string;
  password: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  errors: {
    [key: string]: string[];
  };
}
