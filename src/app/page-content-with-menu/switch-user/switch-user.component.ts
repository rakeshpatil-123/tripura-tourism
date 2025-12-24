import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-switch-user',
  template: `<p>Preparing user session...</p>`
})
export class SwitchUserComponent implements OnInit, OnDestroy {
  private onMessageHandler = this.receiveMessage.bind(this);

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Add message listener first so we don't miss the incoming SET_SESSION message.
    window.addEventListener('message', this.onMessageHandler, false);

    // Tell the opener we are ready to receive the session payload
    try {
      if (window.opener && !window.opener.closed) {
        // Use same-origin target so opener's origin check matches.
        window.opener.postMessage('SWITCH_USER_READY', window.location.origin);
      }
    } catch (e) {
      console.warn('Could not message opener', e);
    }
  }

  receiveMessage(event: MessageEvent) {
    // Strict same-origin check for security
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.action !== 'SET_SESSION' || !data.payload) return;

    const p = data.payload;
    // Save into sessionStorage (per-tab) — do NOT overwrite localStorage.
    sessionStorage.setItem('token', p.token || '');
    sessionStorage.setItem('token_type', p.token_type || 'bearer');
    sessionStorage.setItem('expires_in', p.expires_in || '');
    sessionStorage.setItem('userId', p.data?.id ?? '');
    sessionStorage.setItem('userName', p.data?.authorized_person_name ?? '');
    sessionStorage.setItem('userRole', p.data?.user_type ?? '');
    sessionStorage.setItem('email_id', p.data?.email_id ?? '');
    sessionStorage.setItem('user_name', p.data?.user_name ?? '');
    sessionStorage.setItem('bin', p.data?.bin ?? '');
    sessionStorage.setItem('name_of_enterprise', p.data?.name_of_enterprise ?? '');
    // any other fields...

    // Flag to indicate this tab holds a session in sessionStorage
    sessionStorage.setItem('isTabUserSession', 'true');

    // Optionally tell the opener we have set the session
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage('SWITCH_USER_SESSION_SET', window.location.origin);
      }
    } catch (e) {
      // non-fatal
    }

    // Navigate to the user's home/dashboard in this tab
    this.router.navigateByUrl('/dashboard/home').catch(err => {
      // fallback: reload if navigation fails
      console.warn('Navigation to dashboard failed, reloading. ', err);
      window.location.href = '/dashboard/home';
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessageHandler, false);
  }
}
