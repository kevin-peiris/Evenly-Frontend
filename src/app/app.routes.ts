import { Routes } from '@angular/router';
import { AddCustomerComponent } from './pages/add-customer/add-customer.component';
import { ManageCustomerComponent } from './pages/manage-customer/manage-customer.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';


export const routes: Routes = [
    {
        path:"sign-up",
        component:SignupPageComponent
    },
    {
        path:'',
        component:HomepageComponent
    },


    {
        path:"user",
        component:UserDashboardComponent
    },
    {
        path:"manage-customer",
        component:ManageCustomerComponent
    }
];
