// // File: src/app/_interceptors/auth.interceptor.ts
// import { Injectable } from '@angular/core';
// import {
//     HttpEvent,
//     HttpHandler,
//     HttpInterceptor,
//     HttpRequest,
//     HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { GenericService } from '../_service/generic/generic.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//     constructor(private router: Router, private genericService: GenericService) { }

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         let token: string | null = null;

//         // 1️⃣ Priority: SessionStorage token (used in switch-user tab)
//         if (sessionStorage.getItem('token')) {
//             token = sessionStorage.getItem('token');
//         }
//         // 2️⃣ Fallback: LocalStorage token (used in admin or normal user session)
//         else if (localStorage.getItem('token')) {
//             token = localStorage.getItem('token');
//         }

//         // 3️⃣ Clone request and add Authorization header if token is found
//         let authReq = req;
//         if (token) {
//             authReq = req.clone({
//                 setHeaders: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//         }

//         // 4️⃣ Handle responses globally
//         return next.handle(authReq).pipe(
//             catchError((error: HttpErrorResponse) => {
//                 if (error.status === 401 || error.status === 403) {
//                     console.warn('Unauthorized or forbidden, logging out.');
//                     this.genericService.removeSessionData();
//                     this.router.navigate(['/unauthorized']);
//                 }
//                 return throwError(() => error);
//             })
//         );
//     }
// }
