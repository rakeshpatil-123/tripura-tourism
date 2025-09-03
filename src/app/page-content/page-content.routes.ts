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
            },{
                path: 'registration',
                loadComponent: () =>
                    import('./auth/registration/registration.component').then(m => m.RegistrationComponent)
            },{
                path: 'admin',
                loadComponent: () => import('./auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
            },{
                path: 'about-us',
                loadComponent: () =>
                    import('./nav-pages/about-us/about-us.component').then(m => m.AboutUsComponent)
            },{
                path: 'related-departments',
                loadComponent: () =>
                    import('./nav-pages/related-departments/related-departments.component').then(m => m.RelatedDepartmentsComponent)
            },{
                path: 'information-wizard',
                loadComponent: () =>
                    import('./nav-pages/information-wizard/information-wizard.component').then(m => m.InformationWizardComponent)
            },
            
        ]
    }
];                  