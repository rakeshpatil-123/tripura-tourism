import { Routes } from '@angular/router';
import { HomeNewComponent } from './page-content/home-new/home-new.component';

export const routes: Routes = [
    {path: '', component: HomeNewComponent},
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./page-content-with-menu/page-content-with-menu.routes')
                .then(m => m.PAGE_CONTENT_WITH_MENU_ROUTES)
    },
    {
        path: 'page',
        loadChildren: () =>
            import('./page-content/page-content.routes').then(m => m.PAGE_CONTENT_ROUTES)
    },
    {
        path: 'admin',
        loadChildren: () => import('./page-content/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
    },
    {
        path: 'unauthorized',
        loadComponent: () =>
            import('./page-template/unauthorized/unauthorizedd/unauthorizedd.component').then(m => m.UnauthorizeddComponent)
    }
];
