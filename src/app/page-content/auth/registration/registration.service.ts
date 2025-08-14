// registration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationData } from './registration.mode';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private apiUrl = 'http://swaagatstaging.tripura.cloud/api/user/register';

  constructor(private http: HttpClient) {}

  registerUser(userData: RegistrationData): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}
