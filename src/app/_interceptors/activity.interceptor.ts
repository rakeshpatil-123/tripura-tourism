// import { Injectable } from '@angular/core';
// import {
//     HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { tap, finalize } from 'rxjs/operators';
// import { ActivityLoggerService } from '../_service/activity-log/activity-logger.service';

// @Injectable()
// export class ActivityInterceptor implements HttpInterceptor {
//     constructor(private logger: ActivityLoggerService) { }

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         // prevent logging logs endpoint itself
//         debugger
//         if (req.url.includes('/api/activity/log')) return next.handle(req);

//         const method = req.method.toUpperCase();
//         const shouldLog = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
//         const payloadSummary = req.body && typeof req.body === 'object' ? { keys: Object.keys(req.body).slice(0, 20) } : null;
//         let status: number | null = null;

//         return next.handle(req).pipe(
//             tap(event => { if (event instanceof HttpResponse) status = event.status; }),
//             finalize(() => {
//                 if (shouldLog) {
//                     void this.logger.log({
//                         action: `http.${method}`,
//                         payload_summary: payloadSummary,
//                         metadata: { autoLogged: true },
//                         method,
//                         url: req.urlWithParams,
//                         response_status: status
//                     });
//                 }
//             })
//         );
//     }
// }
