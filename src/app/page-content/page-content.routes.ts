import { Routes } from "@angular/router";
import { PageContentComponent } from "./page-content.component";
import { LoginComponent } from "./auth/login/login.component";
import { HomeComponent } from "./home/home.component";

export const PAGE_CONTENT_ROUTES: Routes = [
    {
        path: '',
        canActivate: [],
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'registration',
                loadComponent: () =>
                    import('./auth/registration/registration.component').then(m => m.RegistrationComponent)
            },
            {
                path: 'admin',
                loadComponent: () => import('./auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
            },
            {
                path: 'about-us',
                loadComponent: () =>
                    import('./nav-pages/about-us/about-us.component').then(m => m.AboutUsComponent)
            },
            {
                path: 'related-departments',
                loadComponent: () =>
                    import('./nav-pages/related-departments/related-departments.component').then(m => m.RelatedDepartmentsComponent)
            },
            {
                path: 'information-wizard',
                loadComponent: () =>
                    import('./nav-pages/information-wizard/information-wizard.component').then(m => m.InformationWizardComponent)
            },
            {
                path: 'acts-rules',
                loadComponent: () =>
                    import('./nav-pages/acts-rules/acts-rules.component').then(m => m.ActsRulesComponent)
            },
            {
                path: 'contact-us',
                loadComponent: () =>
                    import('./nav-pages/contact-us/contact-us.component').then(m => m.ContactUsComponent)
            },
            {
                path: 'feedback-rating',
                loadComponent: () =>
                    import('./nav-pages/feedback-rating/feedback-rating.component').then(m => m.FeedbackRatingComponent)
            },
            {
                path: 'incentive-calculator',
                loadComponent: () =>
                    import('./nav-pages/incentive-calculator/incentive-calculator.component').then(m => m.IncentiveCalculatorComponent)
            },
            {
                path: 'swaagat-certificate-verification',
                loadComponent: () =>
                    import('./nav-pages/swaagat-certificate-verification/swaagat-certificate-verification.component').then(m => m.SwaagatCertificateVerificationComponent)
            },
            {
                path: 'incentive',
                loadComponent: () =>
                    import('./nav-pages/incentive/incentive.component').then(m => m.IncentiveComponent)
            },
            {
                path: 'investor-facilitation-cell',
                loadComponent: () =>
                    import('./nav-pages/investor-facilitation-cell/investor-facilitation-cell.component').then(m => m.InvestorFacilitationCellComponent)
            },
                   {
                path: 'central-inspection-system',
                loadComponent: () =>
                    import('./nav-pages/central-inspection-system/central-inspection-system.component').then(m => m.CentralInspectionSystemComponent)
            },
         
            {
                path: 'mis-reports',
                loadComponent: () =>
                    import('./nav-pages/mis-reports/mis-reports.component').then(m => m.MisReportsComponent)
            },
            {
                path: 'grievance',
                loadComponent: () =>
                    import('./nav-pages/grievance/grievance.component').then(m => m.GrievanceComponent)
            },
            {
                path: 'queries',
                loadComponent: () =>
                    import('./nav-pages/queries/queries.component').then(m => m.QueriesComponent)
            },
            {
                path: 'incentive-reports',
                loadComponent: () =>
                    import('./nav-pages/incentive-report/incentive-report.component').then(m => m.IncentiveReportComponent)
            },
            {
                path: 'central-inspection-agency',
                loadComponent: () =>
                    import('./nav-pages/central-inspection-agency/central-inspection-agency.component').then(m => m.CentralInspectionAgencyComponent)
            },
            {
                path: 'online-single-window-report',
                loadComponent: () =>
                    import('./nav-pages/online-single-window-report/online-single-window-report.component').then(m => m.OnlineSingleWindowReportComponent)
            },
            {
                path: 'registration-report',
                loadComponent: () =>
                    import('./nav-pages/registration-report/registration-report.component').then(m => m.RegistrationReportComponent)
            },
            {
                path: 'land-availability',
                loadComponent: () =>
                    import('./nav-pages/land-availability/land-availability.component').then(m => m.LandAvailabilityComponent)
            },
            {
                path: 'land-availability-gis',
                loadComponent: () =>
                    import('./nav-pages/land-availability-gis/land-availability-gis.component').then(m => m.LandAvailabilityGisComponent)
            },
            {
                path: 'list-of-services',
                loadComponent: () =>
                    import('./nav-pages/list-of-services/list-of-services.component').then(m => m.ListOfServicesComponent)
            },
            {
                path: 'query-feedback',
                loadComponent: () =>
                    import('./nav-pages/query-feedback/query-feedback.component').then(m => m.QueryFeedbackFormComponent)
            },
            {
                path: 'investor-query',
                loadComponent: () =>
                    import('./nav-pages/investor-query/investor-query.component').then(m => m.InvestorQueryComponent)
            },
            {
                path: 'try-buttons',
                loadComponent: () =>
                    import('./nav-pages/try-use/try-use.component').then(m => m.TryUseComponent)
            },
        ]
    }
];