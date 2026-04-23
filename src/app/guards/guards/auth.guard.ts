import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] || [];
  const qp = route.queryParamMap;

  const token = qp.get('token');
  const userType = qp.get('user_type');

  if (token) {
    const valuesToStore: Record<string, string> = {
      token: qp.get('token') ?? '',
      token_type: qp.get('token_type') ?? '',
      expires_in: qp.get('expires_in') ?? '',
      id: qp.get('id') ?? qp.get('user_id') ?? '',
      userId: qp.get('id') ?? qp.get('user_id') ?? '',
      user_name: qp.get('user_name') ?? '',
      authorized_person_name: qp.get('authorized_person_name') ?? '',
      userName: qp.get('authorized_person_name') ?? qp.get('user_name') ?? '',
      name_of_enterprise: qp.get('name_of_enterprise') ?? '',
      email_id: qp.get('email_id') ?? '',
      pan: qp.get('pan') ?? '',
      user_type: qp.get('user_type') ?? '',
      is_pan_verified: qp.get('is_pan_verified') ?? '',
      bin: qp.get('bin') ?? '',
      service_id: qp.get('service_id') ?? '',
      returnUrl: qp.get('returnUrl') ?? '',
    };

    Object.entries(valuesToStore).forEach(([key, value]) => {
      if (value !== '') {
        localStorage.setItem(key, value);
      }
    });

    localStorage.setItem('userRole', userType || 'individual');
  }

  const storedRole = localStorage.getItem('userRole');

  if (storedRole && allowedRoles.includes(storedRole)) {
    return true;
  }
  return router.parseUrl('/unauthorized');
};
