import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const userRole = localStorage.getItem('userRole');
  const allowedRoles: string[] = route.data?.['roles'] || [];


  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }
  return router.parseUrl('/unauthorized');
};
