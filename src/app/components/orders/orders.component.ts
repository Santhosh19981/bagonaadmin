import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { HeaderComponent } from "../header/header.component";
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [SidemenuComponent, CommonModule, FormsModule, HeaderComponent],
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

    // Filters
    selectedBusinessType: string = 'all';
    selectedServiceFilter: string = 'all';
    selectedPaymentStatus: string = 'all';
    dateFrom: string = '';
    dateTo: string = '';
    servicesList: any[] = [];

    // ── Completion Proof ────────────────────────────────────────────────────────
    proofImages: any[] = [];           // loaded proof images for the open order
    proofLoading: boolean = false;
    proofUploading: boolean = false;
    proofError: string = '';
    proofSuccess: string = '';
    MIN_PROOF_IMAGES = 3;

    // Status-change guard
    pendingStatusValue: string = '';   // value admin tried to set
    showProofRequiredAlert: boolean = false;

    constructor(private apiService: ApiService, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.loadOrders();
        this.apiService.getServices().subscribe((res: any) => {
            if (res.status === 'success' || res.status === true) {
                this.servicesList = res.data;
            }
        });
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

    onFilterChange() {
        if (this.selectedBusinessType !== 'vendor') {
            this.selectedServiceFilter = 'all';
        }
        this.applyFilters();
    }

    applyFilters() {
        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = !this.searchQuery ||
                order.order_id.toString().includes(this.searchQuery) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(this.searchQuery.toLowerCase()));

            const matchesTab = this.activeTab === 'all' ||
                (this.activeTab === 'Pending' && (order.payment_status === 'Awaiting Payment' || order.payment_status === 'pending' || order.payment_status === 'Pending')) ||
                order.payment_status.toLowerCase() === this.activeTab.toLowerCase();

            const isChef = order.booking_type === 'chef_booking';
            const isVendor = !isChef && order.booking_type;

            let matchesBusinessType = true;
            if (this.selectedBusinessType === 'chef') matchesBusinessType = isChef;
            if (this.selectedBusinessType === 'vendor') matchesBusinessType = isVendor;

            let matchesService = true;
            if (this.selectedBusinessType === 'vendor' && this.selectedServiceFilter !== 'all') {
                if (order.vendor_services) {
                    const vendorServicesArr = String(order.vendor_services).split(',').map((s: string) => s.trim());
                    matchesService = vendorServicesArr.includes(String(this.selectedServiceFilter));
                } else {
                    matchesService = false;
                }
            }

            let matchesPaymentStatus = true;
            if (this.selectedPaymentStatus !== 'all') {
                const normStatus = this.selectedPaymentStatus === 'pending' ? 'awaiting payment' : this.selectedPaymentStatus.toLowerCase();
                const orderStatus = order.payment_status?.toLowerCase();
                matchesPaymentStatus = orderStatus === normStatus || (this.selectedPaymentStatus === 'pending' && orderStatus === 'pending');
            }

            let matchesDateRange = true;
            const orderDateStr = order.event_date || order.created_at;
            if (orderDateStr) {
                const orderTime = new Date(orderDateStr).getTime();
                if (this.dateFrom) {
                    if (orderTime < new Date(this.dateFrom).getTime()) matchesDateRange = false;
                }
                if (this.dateTo) {
                    const toDateObj = new Date(this.dateTo);
                    toDateObj.setHours(23, 59, 59, 999);
                    if (orderTime > toDateObj.getTime()) matchesDateRange = false;
                }
            }

            return matchesSearch && matchesTab && matchesBusinessType && matchesService && matchesPaymentStatus && matchesDateRange;
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
                this.proofImages = [];
                this.proofError = '';
                this.proofSuccess = '';
            },
            error: (err) => {
                console.error('Error loading order detail:', err);
                this.isLoading = false;
            }
        });
    }

    // ── Tab handling ─────────────────────────────────────────────────────────────
    setDetailsTab(tab: string) {
        this.detailsActiveTab = tab;
        if (tab === 'proof') {
            this.loadProofImages();
        }
    }

    // ── Proof Images ─────────────────────────────────────────────────────────────
    get orderId(): string {
        return this.selectedOrder?.order?.order_id || '';
    }

    loadProofImages() {
        if (!this.orderId) return;
        this.proofLoading = true;
        this.apiService.getOrderProofs(this.orderId).subscribe({
            next: (res) => {
                this.proofImages = res.data || [];
                this.proofLoading = false;
            },
            error: () => { this.proofLoading = false; }
        });
    }

    onProofFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        this.proofUploading = true;
        this.proofError = '';
        this.proofSuccess = '';

        const fd = new FormData();
        Array.from(input.files).forEach(f => fd.append('images', f));

        this.apiService.uploadOrderProofs(this.orderId, fd).subscribe({
            next: (res) => {
                this.proofUploading = false;
                this.proofSuccess = `Uploaded successfully! Total: ${res.total} image(s).`;
                this.toastr.success(`${res.total} proof photo(s) uploaded successfully!`, 'Upload Complete');
                this.loadProofImages();
                input.value = '';
            },
            error: (err) => {
                this.proofUploading = false;
                this.proofError = err?.error?.error || 'Upload failed.';
                this.toastr.error(this.proofError, 'Upload Failed');
            }
        });
    }

    deleteProof(proofId: number) {
        this.apiService.deleteOrderProof(this.orderId, proofId).subscribe({
            next: () => {
                this.toastr.success('Proof photo removed.', 'Deleted');
                this.loadProofImages();
            },
            error: () => {
                this.proofError = 'Delete failed.';
                this.toastr.error('Failed to delete proof photo.', 'Error');
            }
        });
    }

    // ── Status update with proof guard ────────────────────────────────────────────
    updateStatus(orderId: number, status: string, type: 'payment' | 'booking') {
        // Guard: booking → completed requires ≥ 3 proof images
        if (type === 'booking' && status === 'completed') {
            this.apiService.getOrderProofCount(String(orderId)).subscribe({
                next: (res) => {
                    if (res.total < this.MIN_PROOF_IMAGES) {
                        this.pendingStatusValue = status;
                        this.showProofRequiredAlert = true;
                        // Reset the dropdown back to current status
                        if (this.selectedOrder?.booking) {
                            // Force Angular re-evaluation by temporarily toggling
                        }
                    } else {
                        this.doUpdateStatus(orderId, status, type);
                    }
                },
                error: () => {
                    // On error, show alert to be safe
                    this.showProofRequiredAlert = true;
                }
            });
        } else {
            this.doUpdateStatus(orderId, status, type);
        }
    }

    dismissProofAlert() {
        this.showProofRequiredAlert = false;
        this.pendingStatusValue = '';
        // Switch to the proof tab so admin can upload
        this.detailsActiveTab = 'proof';
        this.loadProofImages();
    }

    private doUpdateStatus(orderId: number, status: string, type: 'payment' | 'booking') {
        const payload = type === 'payment' ? { payment_status: status } : { booking_status: status };
        const label = type === 'payment' ? 'Payment status' : 'Booking status';
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
        this.apiService.updateOrderStatus(orderId, payload).subscribe({
            next: () => {
                this.toastr.success(`${label} updated to <b>${displayStatus}</b>`, 'Status Updated', { enableHtml: true });
                this.loadOrders();
                if (this.selectedOrder) {
                    this.apiService.getOrderDetail(this.selectedOrder.booking.booking_id).subscribe(res => this.selectedOrder = res);
                }
            },
            error: () => {
                this.toastr.error(`Failed to update ${label.toLowerCase()}. Please try again.`, 'Update Failed');
            }
        });
    }

    closeDetails() {
        this.showTemplate = false;
        this.selectedOrder = null;
        this.proofImages = [];
        this.showProofRequiredAlert = false;
    }

    toggle() {
        this.showTemplate = !this.showTemplate;
    }

    setServiceCategory(category: string) {
        this.servicesActiveCategory = category;
    }
}
