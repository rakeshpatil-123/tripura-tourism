import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

interface ApiResponse<T>{
  status:number
  data:T
  message:string

}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}


  login(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/page/login`, data);
  }

  getInspection(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inspection/${id}`);
  }

}