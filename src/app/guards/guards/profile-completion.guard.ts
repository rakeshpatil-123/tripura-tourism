import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, catchError, of, take } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';

export const profileCompletionGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const genericService = inject(GenericService);
    const userRole = localStorage.getItem('userRole') || '';
    if (userRole !== 'individual') {
        return true;
    }
    return genericService.getProfile().pipe(
        take(1),
        map((res: any) => {
            const data = res?.data || res;
            const pan = (data?.pan ?? '').toString().trim();
            const district = (data?.district_code ?? data?.district ?? '').toString().trim();
            const subdivision = (data?.subdivision_code ?? data?.subdivision_name ?? '').toString().trim();
            const ulb = (data?.ulb_code ?? data?.ulb_name ?? '').toString().trim();

            const allPresent = pan !== '' && district !== '' && subdivision !== '' && ulb !== '';
            const missingFields: string[] = [];

            if (!pan) missingFields.push('PAN');
            if (!district) missingFields.push('District');
            if (!subdivision) missingFields.push('Subdivision');
            if (!ulb) missingFields.push('ULB');

            if (missingFields.length === 0) {
                // genericService.openSnackBar('Profile is complete', 'Close');
            } else {
                genericService.openSnackBar(
                    `Please update: ${missingFields.join(', ')}`,
                    'Update Profile'
                );
            }
            if (allPresent) {
                return true;
            }
            return router.parseUrl('/dashboard/user-profile');
        }),
        catchError((err) => {
            console.error('profileCompletionGuard error', err);
            return of(router.parseUrl('/dashboard/user-profile'));
        })
    );
};