import { Routes } from '@angular/router';
import { AddCustomerComponent } from './pages/add-customer/add-customer.component';
import { ManageCustomerComponent } from './pages/manage-customer/manage-customer.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UserMainComponent } from './pages/user-main/user-main.component';
import { GroupPageComponent } from './pages/group-page/group-page.component';

export const routes: Routes = [
    {
        path: '',
        component: HomepageComponent
    },
    {
        path: 'sign-up',
        component: SignupPageComponent
    },
    {
        path: 'user-main',
        component: UserMainComponent,
        children: [
            {
                path: 'user-profile',
                component: UserProfileComponent
            },
            {
                path: 'user-dashboard',
                component: UserDashboardComponent,
            },
            {
                path: 'user-group',
                component: GroupPageComponent,
            }
        ]
    },
    {
        path: '**',
        redirectTo: '' // Redirect any undefined routes to homepage or a 404 page
    }
];
