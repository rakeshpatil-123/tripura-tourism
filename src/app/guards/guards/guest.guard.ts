import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
export const guestGuard: CanActivateFn = (route, state): boolean | UrlTree => {
    const router = inject(Router);
    const token = localStorage.getItem('token');
    if (!token) return true;
    return router.parseUrl('dashboard/home');
}