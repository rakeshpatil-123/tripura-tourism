import { Routes } from '@angular/router';
import { PageContentWithMenu } from './page-content-with-menu';


export const PAGE_CONTENT_WITH_MENU_ROUTES: Routes = [
    {
        path: '',
        component: PageContentWithMenu,
        canActivate: [],
        children: [
            {
                path: 'home',
                loadComponent: () =>
                    import('./dashboard/dashboard').then(m => m.Dashboard)
            }
        ]
    }
];