import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SessionExpiryInterceptor } from './app/_interceptors/session-expiry.interceptor';

bootstrapApplication(AppComponent, {
  providers: [appConfig.providers, provideHttpClient(withInterceptorsFromDi()), { provide: HTTP_INTERCEPTORS, useClass: SessionExpiryInterceptor, multi: true }
  ]
})
  .catch(err => console.error(err));