import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://bhagona-backend-v2.vercel.app';

  constructor(private http: HttpClient) { }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  getEvents() {
    return this.http.get(`${this.baseUrl}/events`);
  }

  createEvent(formData: FormData) {
    return this.http.post(`${this.baseUrl}/events/create`, formData);
  }

  updateEvent(id: any, formData: FormData) {
    return this.http.put(`${this.baseUrl}/events/update/${id}`, formData);
  }

  deleteEvent(id: any) {
    return this.http.delete(`${this.baseUrl}/events/delete/${id}`);
  }

  getServices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/services`);
  }

  /** Create new service */
  createService(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/services/create`, formData);
  }

  /** Update service */
  updateService(id: any, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/services/update/${id}`, formData);
  }

  /** Delete service */
  deleteService(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/services/delete/${id}`);
  }


  /** Get all menu items */
  getMenuItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items`);
  }

  /** Get veg or non-veg items  */
  filterMenuItems(type: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-items/filter?type=${type}`);
  }

  /** Create new menu item */
  createMenuItem(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/menu-items/create`, formData);
  }

  /** Update menu item */
  updateMenuItem(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/menu-items/update/${id}`, formData);
  }

  /** Delete menu item */
  deleteMenuItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/menu-items/delete/${id}`);
  }

  getServiceItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}/service-items`);
  }

  createServiceItem(fd: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/service-items/create`, fd);
  }

  updateServiceItem(id: number, fd: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/service-items/update/${id}`, fd);
  }

  deleteServiceItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/service-items/delete/${id}`);
  }


  // USER APPROVALS API CALLS (Updated)
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/approvals/all`);
  }

  getPendingUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/approvals/pending`);
  }

  getApprovedUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/approvals/approved`);
  }

  getRejectedUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/approvals/rejected`);
  }

  approveUser(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/approvals/approve/${id}`, {});
  }

  rejectUser(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/approvals/reject/${id}`, {});
  }

  getCustomers(): Observable<any> {
    return this.http.get(this.baseUrl + "/profiles/customers");
  }

  getChefs(): Observable<any> {
    return this.http.get(this.baseUrl + "/profiles/chefs");
  }

  getVendors(): Observable<any> {
    return this.http.get(this.baseUrl + "/profiles/vendors");
  }

  updateActiveStatus(id: number, isactive: number): Observable<any> {
    return this.http.put(this.baseUrl + `/profiles/status/${id}`, { isactive });
  }

  registerChef(formData: any): Observable<any> {
    // Assuming /addUser handles registration as provided in the backend snippet
    return this.http.post(`${this.baseUrl}/addUser`, formData);
  }

  updateChefProfile(id: number, chefData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profiles/update-chef/${id}`, chefData);
  }

  deleteChef(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profiles/delete-chef/${id}`);
  }

  getPaymentHistory(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/payment/history/${userId}`);
  }

  // MENU CATEGORY API
  getMenuCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-categories`);
  }

  createMenuCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/menu-categories/create`, formData);
  }

  updateMenuCategory(id: any, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/menu-categories/update/${id}`, formData);
  }

  deleteMenuCategory(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/menu-categories/delete/${id}`);
  }

  // MENU SUBCATEGORY API
  getMenuSubcategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-subcategories`);
  }

  getMenuSubcategoriesByCategory(categoryId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu-subcategories/category/${categoryId}`);
  }

  createMenuSubcategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/menu-subcategories/create`, formData);
  }

  updateMenuSubcategory(id: any, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/menu-subcategories/update/${id}`, formData);
  }

  deleteMenuSubcategory(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/menu-subcategories/delete/${id}`);
  }

}