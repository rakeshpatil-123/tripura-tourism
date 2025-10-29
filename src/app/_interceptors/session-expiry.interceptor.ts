import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GenericService } from '../_service/generic/generic.service';

@Injectable()
export class SessionExpiryInterceptor implements HttpInterceptor {

  constructor(private genericService: GenericService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = error?.error?.message || error?.message;
        if (error.status === 401 && message && message !== 'Invalid credentials') {
          if (message === 'Unauthenticated.' || message === 'Session expired due to inactivity') {
            this.genericService.autoLogout();
          }
        }
        return throwError(() => error);
      })
    );
  }
}
