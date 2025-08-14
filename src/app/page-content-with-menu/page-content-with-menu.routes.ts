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
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'external-services-tracking',
        loadComponent: () =>
          import(
            './external-services-redirection-tracking/external-services-redirection-tracking.component'
          ).then((m) => m.ExternalServicesRedirectionTrackingComponent),
      },
      {
        path: 'application-list',
        loadComponent: () =>
          import(
            './industrial-user/application-list/application-list.component'
          ).then((m) => m.ApplicationSearchPageComponent),
      },
      {
        path: 'renewal-list',
        loadComponent: () =>
          import(
            './industrial-user/renewal-of-licance/renewal-of-licance.component'
          ).then((m) => m.RenewalOfLicanceComponent),
      },
      {
        path: 'inspection-list',
        loadComponent: () =>
          import('./industrial-user/inspection/inspection.component').then(
            (m) => m.InspectionComponent
          ),
      },
      {
        path: 'appeal-list',
        loadComponent: () =>
          import('./industrial-user/appeal/appeal.component').then(
            (m) => m.AppealComponent
          ),
      },
      {
        path: 'upload-existing-licence',
        loadComponent: () =>
          import(
            './industrial-user/upload-existing-licence/upload-existing-licence.component'
          ).then((m) => m.UploadExistingLicenceComponent),
      },
      {
        path: 'example-form',
        loadComponent: () =>
          import('./example-form/example-form.component').then(
            (m) => m.ExampleFormComponent
          ),
      },
      {
        path: 'demo',
        loadComponent: () =>
          import('./demo/demo.component').then(
            (m) => m.DemoComponent
          ),
      },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('./user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
      },
    ],
  },
];
