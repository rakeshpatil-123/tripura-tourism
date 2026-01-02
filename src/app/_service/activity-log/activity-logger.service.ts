// import { Injectable, OnDestroy } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router, NavigationEnd } from '@angular/router';
// import { filter } from 'rxjs/operators';
// import { getDeviceInfo, sha256Hex } from '../../lib/device-info.util';

import { OnDestroy } from "@angular/core";

// export interface ActivityEvent {
//     action: string;
//     resource_type?: string;
//     resource_id?: string | number;
//     payload_summary?: any;
//     metadata?: Record<string, any>;
//     user_id?: number | null;
//     dept_id?: number | null;
//     role?: string | null;
//     timestamp?: string;
//     timezone?: string | null;
//     timezoneOffsetMinutes?: number | null;
//     device_info?: any;
//     payload_hash?: string | null;
//     ip?: string | null;
//     method?: string | null;
//     url?: string | null;
//     response_status?: number | null;
// }

// const STORAGE_KEY = 'app_activity_log_buffer_v1';

// @Injectable({ providedIn: 'root' })
export class ActivityLoggerService {}
//     private buffer: ActivityEvent[] = [];
//     private flushInterval = 5000;
//     private flushTimer: any;
//     private maxBatch = 10;
//     private endpoint = '/api/activity/log'; // backend endpoint - accept { batched: [...] }
//     private userProvider?: () => { id?: number, dept_id?: number, role?: string } | null;

//     constructor(private http: HttpClient, private router: Router) {
//         try {
//             const raw = localStorage.getItem(STORAGE_KEY);
//             if (raw) this.buffer = JSON.parse(raw) || [];
//         } catch { this.buffer = []; }

//         this.flushTimer = setInterval(() => this.flushIfNeeded(), this.flushInterval);

//         // Auto-log navigation (optional)
//         this.router.events.pipe(filter(evt => evt instanceof NavigationEnd)).subscribe((evt: any) => {
//             this.log({
//                 action: 'navigation',
//                 payload_summary: { url: evt.urlAfterRedirects },
//                 metadata: { nav: true }
//             }).catch(() => { });
//         });
//     }

//     setUserProvider(fn: () => { id?: number, dept_id?: number, role?: string } | null) {
//         this.userProvider = fn;
//     }

//     private sanitizePayload(payload: any): any {
//         if (!payload || typeof payload !== 'object') return payload;
//         const clone: any = Array.isArray(payload) ? [] : {};
//         const SENSITIVE = ['password', 'password_confirmation', 'token', 'access_token', 'refresh_token', 'card_number', 'ssn'];
//         for (const k of Object.keys(payload)) {
//             if (SENSITIVE.includes(k.toLowerCase())) clone[k] = '***REDACTED***';
//             else {
//                 const v = payload[k];
//                 clone[k] = (typeof v === 'object' && v !== null) ? this.sanitizePayload(v) : v;
//             }
//         }
//         return clone;
//     }

//     async log(event: Partial<ActivityEvent>) {
//         const user = (this.userProvider && this.userProvider()) || null;
//         const deviceInfo = getDeviceInfo();
//         const ts = new Date().toISOString();
//         const payloadSummary = event.payload_summary ? this.sanitizePayload(event.payload_summary) : null;
//         const payloadHash = payloadSummary ? await sha256Hex(payloadSummary) : null;

//         const e: ActivityEvent = {
//             action: event.action || 'unknown',
//             resource_type: event.resource_type,
//             resource_id: event.resource_id,
//             payload_summary: payloadSummary,
//             metadata: event.metadata || {},
//             user_id: user?.id ?? null,
//             dept_id: user?.dept_id ?? null,
//             role: user?.role ?? null,
//             timestamp: ts,
//             // timezone: deviceInfo.timezone,
//             timezoneOffsetMinutes: deviceInfo.timezoneOffsetMinutes,
//             device_info: deviceInfo,
//             payload_hash: payloadHash,
//             ip: null,
//             method: event.method ?? null,
//             url: event.url ?? null,
//             response_status: event.response_status ?? null
//         };

//         this.buffer.push(e);
//         this.persistBuffer();

//         if (this.buffer.length >= this.maxBatch) await this.flush();
//     }

//     private persistBuffer() {
//         try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.buffer)); } catch { }
//     }

//     async flushIfNeeded() {
//         if (!navigator.onLine) return;
//         if (!this.buffer.length) return;
//         await this.flush();
//     }

//     async flush() {
//         if (!this.buffer.length) return;
//         const batch = [...this.buffer];
//         this.buffer = [];
//         this.persistBuffer();
//         debugger
//         try {
//             await this.http.post(this.endpoint, { batched: batch }).toPromise();
//         } catch (err) {
//             console.error('Activity log flush failed', err);
//             this.buffer = batch.concat(this.buffer).slice(0, 1000);
//             this.persistBuffer();
//         }
//     }

//     ngOnDestroy() { clearInterval(this.flushTimer); }
// }
