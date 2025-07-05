import { Routes } from '@angular/router';
import { PageContentWithMenuComponent } from './page-content-with-menu.component';



export const PAGE_CONTENT_WITH_MENU_ROUTES: Routes = [
    {
        path: '',
        component: PageContentWithMenuComponent,
        canActivate: [],

        children: [
            {
                path: 'home',
                loadComponent: () =>
                    import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'external-services-tracking',
                loadComponent: () =>
                    import('./external-services-redirection-tracking/external-services-redirection-tracking.component').then(m => m.ExternalServicesRedirectionTrackingComponent)
            },
            {
                path: 'example-form',
                loadComponent: () =>
                    import('./example-form/example-form.component').then(m => m.ExampleFormComponent)
            },
        ]
    }
];