import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CheffsComponent } from './components/cheffs/cheffs.component';
import { LoginComponent } from './components/login/login.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { UsersComponent } from './components/users/users.component';
import { VendorsComponent } from './components/vendors/vendors.component';
import { AuthGuard } from './auth.guard';
import { EventsComponent } from './components/events/events.component';
import { ServicesComponent } from './components/services/services.component';
import { ServiceItemsComponent } from './components/service-items/service-items.component';
import { MenuItemsComponent } from './components/menu-items/menu-items.component';
import { ApprovalsComponent } from './components/approvals/approvals.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full',  },
    { path: 'events', component: EventsComponent,canActivate:  [AuthGuard]  },
      { path: 'services', component: ServicesComponent,canActivate:  [AuthGuard]  },
             { path: 'menu-items', component: MenuItemsComponent,canActivate:  [AuthGuard]  },
        { path: 'service-items', component: ServiceItemsComponent,canActivate:  [AuthGuard]  },
  { path: 'dashboard', component: DashboardComponent,canActivate:  [AuthGuard]  },
  { path: 'cheffs', component: CheffsComponent , canActivate:  [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'orders', component: OrdersComponent,canActivate:  [AuthGuard]  },
  { path: 'payment-history', component: PaymentHistoryComponent,canActivate:  [AuthGuard]  },
  { path: 'users', component: UsersComponent,canActivate:  [AuthGuard]  },
   { path: 'vendors', component: VendorsComponent,canActivate:  [AuthGuard]  },
   { path: 'approvals', component: ApprovalsComponent,canActivate:  [AuthGuard]  },
   
];
