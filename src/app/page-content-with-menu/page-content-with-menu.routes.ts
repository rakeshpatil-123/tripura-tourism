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
        path: 'renewal-application-list',
        loadComponent: () =>
          import(
            './industrial-user/renewal-of-licance/renewal-of-licance.component'
          ).then((m) => m.RenewalOfLicanceComponent),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'renewal-list/:serviceId/:appId',
        loadComponent: () =>
          import(
            './industrial-user/renewal-list/renewal-list.component'
          ).then((m) => m.RenewalListComponent),
        canActivate: [authGuard],
        data: { roles: ['individual'] }
      },
      {
        path: 'renewal-application-submission/:sId/:appId/:renID',
        loadComponent: () =>
          import(
            './industrial-user/renewal-application-submission/renewal-application-submission.component'
          ).then((m) => m.RenewalApplicationSubmissionComponent),
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
      {
        path: 'inspection-view/:inspectionId',
        loadComponent: () =>
          import('./industrial-user/inspection-view/inspection-view.component').then(
            (m) => m.InspectionViewComponent
          ),
          canActivate: [authGuard],
          data: { roles: ['individual'] }
      },
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
        data: { roles: ['individual'] }
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
        path: 'service-feedback/:id',
        loadComponent: () =>
          import(
            './industrial-user/service-feedback/service-feedback.component'
          ).then((m) => m.ServiceFeedbackComponent),
        canActivate: [authGuard],
        data: { roles: [ 'individual'] }
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
        path: 'my-departmental-applications',
        loadComponent: () =>
          import(
            '../page-content-with-menu/my-departmental-applications/my-departmental-applications.component'
          ).then((m) => m.MyDepartmentalApplicationsComponent),
        canActivate: [authGuard],
        data: { roles: ['department',] }
      },
      {
        path: 'json-to-excel',
        loadComponent: () =>
          import(
            '../page-content-with-menu/sales-report/sales-report.component'
          ).then((m) => m.SalesReportComponent),
        canActivate: [authGuard],
        data: { roles: ['department', 'individual', 'admin'] }
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
        path: 'licence-details/:id',
        loadComponent: () =>
          import(
            './industrial-user/license-details/license-details.component'
          ).then((m) => m.LicenseDetailsComponent),
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
      {
        path: 'payments',
        loadComponent: () =>
          import('./industrial-user/all-payments/all-payments.component').then(
            (m) => m.AllPaymentsComponent
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
        path: 'feedback',
        loadComponent: () =>
          import('./feedback-dashboard/feedback-dashboard.component').then(
            (m) => m.FeedbackDashboardComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin', 'department'] }
      },
      {
        path: 'service-feedback',
        loadComponent: () =>
          import('./service-feedback/service-feedback.component').then(
            (m) => m.ServiceFeedbackComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin', 'department'] }
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
        path: 'departmental-inspection',
        loadComponent: () =>
          import('./departmental-inspection/departmental-inspection.component').then(
            (m) => m.DepartmentalInspectionComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department'] },
      },
      {
        path: 'create-inspection',
        loadComponent: () =>
          import('./add-departmental-inspection/add-departmental-inspection.component').then(
            (m) => m.AddDepartmentalInspectionComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department'] },
      },
      {
        path: 'departmental-inspection-list',
        loadComponent: () =>
          import('./departmental-inspection-list/departmental-inspection-list.component').then(
            (m) => m.DepartmentalInspectionListComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department'] },
      },
      {
        path: 'departmental-inspection-request',
        loadComponent: () =>
          import('./departmental-inspection-request/departmental-inspection-request.component').then(
            (m) => m.DepartmentalInspectionRequestComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['department'] },
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
        path: 'user-payment-list',
        loadComponent: () =>
          import('./user-payment-list/user-payment-list.component').then(
            (m) => m.UserPaymentListComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./activity-log/activity-log.component').then(
            (m) => m.ActivityLogComponent
          ),
        canActivate: [authGuard],
        data: { roles: ['admin'] }
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
      {
        path: 'reports/sales',
        loadComponent: () =>
          import('./sales-report/sales-report.component').then(
            (m) => m.SalesReportComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['individual', 'department'] },
      },
      {
        path: 'reports/users',
        loadComponent: () =>
          import('./user-report/user-report.component').then(
            (m) => m.UserReportComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['individual', 'department'] },
      },
      {
        path: 'reports/payment',
        loadComponent: () =>
          import('./payment/payment.component').then(
            (m) => m.PaymentComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['individual', 'department'] },
      },
      {
        path: 'reports/department-user-list',
        loadComponent: () =>
          import('./department-user-list/department-user-list.component').then(
            (m) => m.DepartmentUserListComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'moderator'] },
      },
      {
        path: 'reports/application-status',
        loadComponent: () =>
          import('./application-status/application-status.component').then(
            (m) => m.ApplicationStatusComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['individual', 'department'] },
      },
      {
        path: 'reports/industry-report-summary',
        loadComponent: () =>
          import('./industry-report-summary/industry-report-summary.component').then(
            (m) => m.IndustryReportSummaryComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'moderator'] },
      },
      {
        path: 'reports/industry-report-details',
        loadComponent: () =>
          import('./industry-report-details/industry-report-details.component').then(
            (m) => m.IndustryReportDetailsComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'moderator'] },
      },
      {
        path: 'reports/noc-issue-status',
        loadComponent: () =>
          import('./nod-issue-status/nod-issue-status.component').then(
            (m) => m.NodIssueStatusComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['individual', 'department'] },
      },
      {
        path: 'reports/cis-summary',
        loadComponent: () =>
          import('./cis-summary/cis-summary.component').then(
            (m) => m.CisSummaryComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'moderator'] },
      },
      {
        path: 'reports/cis-details',
        loadComponent: () =>
          import('./cis-details/cis-details.component').then(
            (m) => m.CisDetailsComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'moderator'] },
      },
      {
        path: 'reports/user-list',
        loadComponent: () =>
          import('./user-list/user-list.component').then(
            (m) => m.UserListComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['moderator', 'department'] },
      },
      {
        path: 'reports/labour-register',
        loadComponent: () =>
          import('./labour-register/labour-register.component').then(
            (m) => m.LabourRegisterComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ['department', 'moderator'] },
      },
    ],
  },
];
