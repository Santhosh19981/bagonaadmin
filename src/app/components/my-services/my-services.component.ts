import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-my-services',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './my-services.component.html',
    styleUrls: ['./my-services.component.scss']
})
export class MyServicesComponent implements OnInit {
    vendorServices: any[] = []; // List of services from GET /vendors/services/:id
    vendorId: number | null = null;
    loading = false;

    selectedService: any = null;
    serviceItems: any[] = []; // List of items from GET /vendors/service-items/:v_id/:s_id
    loadingItems = false;
    savingItems = false;
    isAllSelected = false;
    itemSearchQuery = '';

    get showModal(): boolean {
        return this.selectedService !== null;
    }

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.vendorId = user.id;
        }

        if (this.vendorId) {
            this.loadVendorServices();
        } else {
            this.toastr.error('User session not found. Please login again.', 'Error');
        }
    }

    loadVendorServices() {
        if (!this.vendorId) return;
        this.loading = true;
        this.apiService.getVendorServicesList(this.vendorId).subscribe({
            next: (res: any) => {
                console.log('📦 Vendor Services raw response:', res);
                const rawData = res.data || [];
                // Dynamic mapping for image paths
                this.vendorServices = rawData.map((s: any) => {
                    const item = { ...s };
                    if (item.display_url && item.display_url.startsWith('/')) {
                        item.display_url = `http://localhost:3000${item.display_url}`;
                    }
                    return item;
                });
                console.log('✅ vendorServices populated with full URLs:', this.vendorServices);
                this.loading = false;
            },
            error: (err: any) => {
                this.loading = false;
                console.error('❌ Failed to load services:', err);
                this.toastr.error('Failed to load your services', 'Error');
            }
        });
    }

    get filteredServiceItems(): any[] {
        if (!this.itemSearchQuery) return this.serviceItems;
        const q = this.itemSearchQuery.toLowerCase().trim();
        return this.serviceItems.filter(item =>
            item.name.toLowerCase().includes(q)
        );
    }

    manageItems(service: any) {
        this.selectedService = service;
        this.loadServiceItemsMaster(service.service_id || service.id);
    }

    loadServiceItemsMaster(serviceId: number) {
        if (!this.vendorId) return;
        this.loadingItems = true;
        this.serviceItems = [];
        this.isAllSelected = false;

        this.apiService.getVendorServiceItemsMaster(this.vendorId, serviceId).subscribe({
            next: (res: any) => {
                // res contains items with 'is_selected' flag
                this.serviceItems = res.data || [];
                this.checkIfAllSelected();
                this.loadingItems = false;
            },
            error: () => {
                this.loadingItems = false;
                this.toastr.error('Failed to load items for this service', 'Error');
            }
        });
    }

    toggleItem(item: any) {
        item.is_selected = item.is_selected === 1 ? 0 : 1;
        this.checkIfAllSelected();
    }

    toggleAllItems() {
        const targetState = this.isAllSelected ? 0 : 1;
        this.serviceItems.forEach(item => item.is_selected = targetState);
        this.isAllSelected = !this.isAllSelected;
    }

    checkIfAllSelected() {
        if (this.serviceItems.length === 0) {
            this.isAllSelected = false;
            return;
        }
        this.isAllSelected = this.serviceItems.every(item => item.is_selected === 1);
    }

    saveItems() {
        if (!this.vendorId || !this.selectedService) return;

        const selectedItemIds = this.serviceItems
            .filter(item => item.is_selected === 1)
            .map(item => item.service_item_id);

        this.savingItems = true;
        const payload = {
            vendor_id: this.vendorId,
            service_id: this.selectedService.service_id || this.selectedService.id,
            item_ids: selectedItemIds
        };

        this.apiService.syncVendorItems(payload).subscribe({
            next: () => {
                this.savingItems = false;
                this.toastr.success(`Items for "${this.selectedService.name}" saved!`, 'Success');
                this.loadVendorServices(); // Refresh to update item count
                this.closeItems();
            },
            error: () => {
                this.savingItems = false;
                this.toastr.error('Failed to save items', 'Error');
            }
        });
    }

    closeItems() {
        this.selectedService = null;
        this.serviceItems = [];
        this.isAllSelected = false;
    }

    get selectedItemCount(): number {
        return this.serviceItems.filter(i => i.is_selected === 1).length;
    }
}
