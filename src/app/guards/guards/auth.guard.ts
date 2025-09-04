import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userName = localStorage.getItem('userName');

  if (userName === 'admin' || 'Individual') {
    return true;
  } else {
    router.navigate(['/unauthorized']);
    return false;
  }
};
