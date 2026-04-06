import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { HeaderComponent } from "../header/header.component";

import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [SidemenuComponent, CommonModule, HeaderComponent],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

    orders: any[] = [];
    filteredOrders: any[] = [];
    selectedOrder: any = null;
    showTemplate = false;
    searchQuery: string = '';
    activeTab: string = 'all';
    detailsActiveTab: string = 'events';
    servicesActiveCategory: string = '';
    isLoading: boolean = false;

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user ? user.id : null;
        const role = user ? user.role : null;

        this.apiService.getOrders(userId, role).subscribe({
            next: (res) => {
                this.orders = res.data || [];
                this.applyFilters();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                this.isLoading = false;
            }
        });
    }

    onSearch(query: string) {
        this.searchQuery = query;
        this.applyFilters();
    }

    setFilter(tab: string) {
        this.activeTab = tab;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = !this.searchQuery ||
                order.order_id.toString().includes(this.searchQuery) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(this.searchQuery.toLowerCase()));

            const matchesTab = this.activeTab === 'all' ||
                order.payment_status.toLowerCase() === this.activeTab.toLowerCase();

            return matchesSearch && matchesTab;
        });
    }

    viewDetails(order: any) {
        this.isLoading = true;
        this.apiService.getOrderDetail(order.booking_id).subscribe({
            next: (res) => {
                this.selectedOrder = res;
                this.showTemplate = true;
                this.detailsActiveTab = 'summary'; 
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading order detail:', err);
                this.isLoading = false;
            }
        });
    }

    updateStatus(orderId: number, status: string, type: 'payment' | 'booking') {
        const payload = type === 'payment' ? { payment_status: status } : { booking_status: status };
        this.apiService.updateOrderStatus(orderId, payload).subscribe(() => {
            this.loadOrders();
            if (this.selectedOrder) {
                // Refresh detail
                this.apiService.getOrderDetail(this.selectedOrder.booking.booking_id).subscribe(res => this.selectedOrder = res);
            }
        });
    }

    closeDetails() {
        this.showTemplate = false;
        this.selectedOrder = null;
    }

    toggle() {
        this.showTemplate = !this.showTemplate;
    }

    setDetailsTab(tab: string) {
        this.detailsActiveTab = tab;
    }

    setServiceCategory(category: string) {
        this.servicesActiveCategory = category;
    }
}
