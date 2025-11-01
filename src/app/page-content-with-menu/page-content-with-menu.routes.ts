import { Routes } from '@angular/router';
import { PageContentWithMenuComponent } from './page-content-with-menu.component';
import { authGuard } from '../guards/guards/auth.guard';
import { ProformaListComponent } from './proforma-list/proforma-list.component';
import { IncentiveApplicationsComponent } from './incentive-applications/incentive-applications.component';

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
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'application-list',
        loadComponent: () =>
          import(
            './industrial-user/application-list/application-list.component'
          ).then((m) => m.ApplicationSearchPageComponent),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'renewal-list',
        loadComponent: () =>
          import(
            './industrial-user/renewal-of-licance/renewal-of-licance.component'
          ).then((m) => m.RenewalOfLicanceComponent),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'inspection-list',
        loadComponent: () =>
          import('./industrial-user/inspection/inspection.component').then(
            (m) => m.InspectionComponent
          ),
          canActivate: [authGuard],
          data: { roles: ['individual'] }
      },
      // {
      //   path: 'inspection-view/:inspectionId',
      //   loadComponent: () =>
      //     import('./industrial-user/inspection-view/inspection-view.component').then(
      //       (m) => m.InspectionViewComponent
      //     ),
      //     canActivate: [authGuard],
      //     data: { roles: ['individual'] }
      // },
      {
        path: 'appeal-list',
        loadComponent: () =>
          import('./industrial-user/appeal/appeal.component').then(
            (m) => m.AppealComponent
          ),
          canActivate: [authGuard],
          data: { roles: ['individual'] }
      },
      {
        path: 'caf',
        loadComponent: () =>
          import('./industrial-user/caf/caf.component').then(
            (m) => m.ApplicationFormComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./industrial-user/allServices/services.component').then(
            (m) => m.ServicesComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'eligibility',
        loadComponent: () =>
          import('./industrial-user/incentive/eligibility/eligibility.component').then(
            (m) => m.EligibilityComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'claim',
        loadComponent: () =>
          import('./industrial-user/incentive/claim/claim.component').then(
            (m) => m.ClaimComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'proforma-questionnaire-view/:proformaId/:schemeId',
        loadComponent: () =>
          import('./industrial-user/incentive/proforma-questionnaire-view/proforma-questionnaire-view.component').then(
            (m) => m.ProformaQuestionnaireViewComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'workflow-history/:applicationId',
        loadComponent: () =>
          import('./industrial-user/incentive/workflow-history/workflow-history.component').then(
            (m) => m.WorkflowHistoryComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
  
      {
        path: 'user-app-view/:serviceId/:appId',
        loadComponent: () =>
          import('./industrial-user/user-application-view/user-application-view.component').then(
            (m) => m.UserApplicationViewComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'service-application/:id',
        loadComponent: () =>
          import(
            './industrial-user/service-application/service-application.component'
          ).then((m) => m.ServiceApplicationComponent),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'repeat-application/:serviceid',
        loadComponent: () =>
          import(
            './industrial-user/repeat-applications/repeat-applications.component'
          ).then((m) => m.RepeatApplicationsComponent),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
     {
        path: 'departmental-services',
        loadComponent: () =>
          import(
            '../page-content-with-menu/departmental-services/departmental-services.component'
          ).then((m) => m.DepartmentalServicesComponent),
        canActivate: [authGuard],
        data: { roles: ['department', ] }
      },
    {
        path: 'all-departmental-applications',
        loadComponent: () =>
          import(
            '../page-content-with-menu/all-department-applications/all-department-applications.component'
          ).then((m) => m.AllDepartmentApplicationsComponent),
        canActivate: [authGuard],
        data: { roles: ['department', ] }
      },
      {
        path: 'all-service-application/:departmentId/:serviceId',
        loadComponent: () =>
          import(
            '../page-content-with-menu/all-service-applications/applications.component'
          ).then((m) => m.ApplicationsComponent),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual'] }
      },
      {
        path: 'service-view/:applicationId',
        loadComponent: () =>
          import('./service-view/service-view.component').then(
            (m) => m.ServiceViewComponent
          ),
        data: { roles: [ 'department'] }
      },
      {
        path: 'user-caf-view/:uid',
        loadComponent: () =>
          import('./user-caf-view-dept/user-caf-view-dept.component').then(
            (m) => m.UserCafViewDeptComponent
          ),
        data: { roles: [ 'department'] }
      },

      {
        path: 'upload-existing-licence',
        loadComponent: () =>
          import(
            './industrial-user/upload-existing-licence/upload-existing-licence.component'
          ).then((m) => m.UploadExistingLicenceComponent),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'example-form',
        loadComponent: () =>
          import('./example-form/example-form.component').then(
            (m) => m.ExampleFormComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      // {
      //   path: 'demo',
      //   loadComponent: () =>
      //     import('./demo/demo.component').then(
      //       (m) => m.DemoComponent
      //     ),
      // },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('./user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin', 'department', 'individual'] }
      },
      {
        path: 'admin-services',
        loadComponent: () =>
          import('./admin-services/admin-services.component').then(
            (m) => m.AdminServicesComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'admin-incentive',
        loadComponent: () =>
          import('./admin-incentive/admin-incentive.component').then(
            (m) => m.AdminIncentiveComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'admin-incentive/:schemeId/proformas',
        loadComponent: () =>
          import('./proforma-list/proforma-list.component').then(m => m.ProformaListComponent),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'admin-incentive/:schemeId/proformas/:proformaId/questions',
        loadComponent: () =>
          import('./incentive-questions/incentive-questions.component').then(
            (m) => m.IncentiveQuestionsComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'departmental-user',
        loadComponent: () =>
          import('./departmental-users/departmental-users.component').then(
            (m) => m.DepartmentalUsersComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin', 'department'] }
      },
      {
        path: 'incentive-applications',
        loadComponent: () =>
          import('./incentive-applications/incentive-applications.component').then((m) => m.IncentiveApplicationsComponent),
        canActivate: [authGuard],
        data: { roles: ['department'] }
      },
      {
        path: 'incentive-applications/:id',
        loadComponent: () =>
          import(
            './incentive-application-details/incentive-application-details.component'
          ).then((m) => m.IncentiveApplicationDetailsComponent),
        canActivate: [authGuard],
        data: { roles: ['department'] },
      },
      {
        path: 'business-user',
        loadComponent: () =>
          import('./business-users/business-users.component').then(
            (m) => m.BusinessUsersComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'holidays',
        loadComponent: () =>
          import('./holidays/holidays.component').then(
            (m) => m.HolidaysComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./departments/departments.component').then(
            (m) => m.DepartmentsComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['admin', 'department'] }
      },
    ],
  },
];
