// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-switch-user',
//   template: `<p class="p-4 text-slate-700 text-center">Preparing user session... Please wait.</p>`
// })
// export class SwitchUserComponent implements OnInit, OnDestroy {
//   private messageHandler = this.onMessage.bind(this);

//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     // 1. Start listening before notifying opener
//     window.addEventListener('message', this.messageHandler, false);

//     // 2. Tell opener tab we are ready to receive session payload
//     try {
//       if (window.opener && !window.opener.closed) {
//         window.opener.postMessage('SWITCH_USER_READY', window.location.origin);
//       }
//     } catch (e) {
//       console.warn('[SwitchUser] opener message failed', e);
//     }
//   }

//   private onMessage(ev: MessageEvent) {
//     if (ev.origin !== window.location.origin) return;
//     const data = ev.data;
//     if (!data || data.action !== 'SET_SESSION' || !data.payload) return;

//     const p = data.payload;
//     // Store impersonated user session in this tab only
//     sessionStorage.clear();
//     sessionStorage.setItem('token', p.token || '');
//     sessionStorage.setItem('token_type', p.token_type || 'bearer');
//     sessionStorage.setItem('expires_in', String(p.expires_in || ''));
//     sessionStorage.setItem('userId', String(p.data?.id || ''));
//     sessionStorage.setItem('userName', p.data?.authorized_person_name || '');
//     sessionStorage.setItem('userRole', p.data?.user_type || '');
//     sessionStorage.setItem('email_id', p.data?.email_id || '');
//     sessionStorage.setItem('user_name', p.data?.user_name || '');
//     sessionStorage.setItem('bin', p.data?.bin || '');
//     sessionStorage.setItem('name_of_enterprise', p.data?.name_of_enterprise || '');
//     sessionStorage.setItem('department_name', p.data?.department_name || '');
//     sessionStorage.setItem('designation', p.data?.designation || '');
//     sessionStorage.setItem('district', p.data?.district || '');
//     sessionStorage.setItem('subdivision', p.data?.subdivision || '');
//     sessionStorage.setItem('ulb', p.data?.ulb || '');
//     sessionStorage.setItem('ward', p.data?.ward || '');
//     sessionStorage.setItem('hierarchy', p.data?.hierarchy || '');
//     sessionStorage.setItem('isTabUserSession', 'true');

//     // Optional: notify admin tab we’re ready
//     try {
//       if (window.opener && !window.opener.closed) {
//         window.opener.postMessage('SWITCH_USER_SESSION_SET', window.location.origin);
//       }
//     } catch {}

//     // Redirect impersonated user to dashboard
//     this.router.navigateByUrl('/dashboard/home').catch(() => {
//       window.location.href = '/dashboard/home';
//     });
//   }

//   ngOnDestroy(): void {
//     window.removeEventListener('message', this.messageHandler, false);
//   }
// }
