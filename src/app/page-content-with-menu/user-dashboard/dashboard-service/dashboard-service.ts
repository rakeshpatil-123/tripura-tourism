// dashboard.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { GenericService } from '../../../_service/generic/generic.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardDataSubject = new BehaviorSubject<any>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor(private apiService: GenericService) {
    this.loadData();
  }

  private loadData(): void {
    const uid = localStorage.getItem('userId');
    const payload = { user_id: uid };
    
    this.apiService.getByConditions(
      payload,
      `api/user/get-total-applications-by-user`
    ).pipe(
      tap(data => {
        this.dashboardDataSubject.next(data);
      }),
      catchError(error => {
        console.error('Error fetching dashboard data', error);
        this.dashboardDataSubject.next(null);
        return of(null);
      })
    ).subscribe();
  }

  refreshData(): void {
    this.loadData();
  }
}