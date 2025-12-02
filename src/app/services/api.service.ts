import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000'; // change if deployed

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

  getServiceItems():Observable<any> {
    return this.http.get(`${this.baseUrl}/service-items`);
  }

  createServiceItem(fd: FormData):Observable<any> {
    return this.http.post(`${this.baseUrl}/service-items/create`, fd);
  }

  updateServiceItem(id: number, fd: FormData):Observable<any> {
    return this.http.put(`${this.baseUrl}/service-items/update/${id}`, fd);
  }

  deleteServiceItem(id: number):Observable<any> {
    return this.http.delete(`${this.baseUrl}/service-items/delete/${id}`);
  }




}