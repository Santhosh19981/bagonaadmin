// Menu Category implementation
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
import { MenuCategoryComponent } from './components/menu-category/menu-category.component';
import { ApprovalsComponent } from './components/approvals/approvals.component';
import { MenuSubcategoryComponent } from './components/menu-subcategory/menu-subcategory.component';
import { MyServicesComponent } from './components/my-services/my-services.component';
import { ProfileManagementComponent } from './components/profile-management/profile-management.component';
import { BannerManagementComponent } from './components/banner-management/banner-management.component';
import { ReviewManagementComponent } from './components/review-management/review-management.component';
import { OfferManagementComponent } from './components/offer-management/offer-management.component';
import { AccountsComponent } from './components/accounts/accounts.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full', },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'services', component: ServicesComponent, canActivate: [AuthGuard] },
  { path: 'menu-categories', component: MenuCategoryComponent, canActivate: [AuthGuard] },
  { path: 'menu-subcategories', component: MenuSubcategoryComponent, canActivate: [AuthGuard] },
  { path: 'menu-items', component: MenuItemsComponent, canActivate: [AuthGuard] },
  { path: 'service-items', component: ServiceItemsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'cheffs', component: CheffsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'payment-history', component: PaymentHistoryComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'vendors', component: VendorsComponent, canActivate: [AuthGuard] },
  { path: 'approvals', component: ApprovalsComponent, canActivate: [AuthGuard] },
  { path: 'my-services', component: MyServicesComponent, canActivate: [AuthGuard] },
  { path: 'profile-management', component: ProfileManagementComponent, canActivate: [AuthGuard] },
  { path: 'banner-management', component: BannerManagementComponent, canActivate: [AuthGuard] },
  { path: 'review-management', component: ReviewManagementComponent, canActivate: [AuthGuard] },
  { path: 'offer-management', component: OfferManagementComponent, canActivate: [AuthGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard] },


];
