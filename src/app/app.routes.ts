import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CheffsComponent } from './components/cheffs/cheffs.component';
import { LoginComponent } from './components/login/login.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { UsersComponent } from './components/users/users.component';
import { VendorsComponent } from './components/vendors/vendors.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full',  },
  { path: 'dashboard', component: DashboardComponent,canActivate:  [AuthGuard]  },
  { path: 'cheffs', component: CheffsComponent , canActivate:  [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'orders', component: OrdersComponent,canActivate:  [AuthGuard]  },
  { path: 'payment-history', component: PaymentHistoryComponent,canActivate:  [AuthGuard]  },
  { path: 'users', component: UsersComponent,canActivate:  [AuthGuard]  },
   { path: 'vendors', component: VendorsComponent,canActivate:  [AuthGuard]  },
];
