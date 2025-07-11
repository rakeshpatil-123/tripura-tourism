import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'dashboard',
        loadChildren: () =>
            import('./page-content-with-menu/page-content-with-menu.routes')
                .then(m => m.PAGE_CONTENT_WITH_MENU_ROUTES)
    },
    {
        path: 'auth',
        loadChildren: () =>
            import('./page-content/page-content.routes').then(m => m.PAGE_CONTENT_ROUTES)
    }
];
