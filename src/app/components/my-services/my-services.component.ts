import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { config } from '../../config';

interface CatalogItem {
    item_id: number;
    name: string;
    description?: string;
    quantity_type?: string;
    category_name?: string;
    display_url?: string | null;
    base_price: number;
    is_selected: number;
    /** What the vendor typed; null/'' = use the platform price. */
    priceInput: number | string | null;
}

const MAX_PRICE = 10000000;

@Component({
    selector: 'app-my-services',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './my-services.component.html',
    styleUrls: ['./my-services.component.scss']
})
export class MyServicesComponent implements OnInit {
    vendorServices: any[] = [];
    vendorId: number | null = null;
    loading = false;

    // Item picker modal
    selectedService: any = null;
    catalogKind: 'service' | 'menu' = 'service';
    items: CatalogItem[] = [];
    loadingItems = false;
    savingItems = false;
    itemSearchQuery = '';
    categoryFilter = 'all';
    showOnlySelected = false;
    categories: string[] = [];
    errors: Record<number, string> = {};
    bulkPercent: number | null = null;
    private initialSnapshot = '';

    get showModal(): boolean {
        return this.selectedService !== null;
    }

    constructor(private apiService: ApiService, private toastr: ToastrService) { }

    ngOnInit() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            this.vendorId = user?.id ? Number(user.id) : null;
        } catch {
            this.vendorId = null;
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
                this.vendorServices = (res.data || []).map((s: any) => {
                    const item = { ...s };
                    if (item.display_url && item.display_url.startsWith('/')) {
                        item.display_url = `${config.apiUrl}${item.display_url}`;
                    }
                    return item;
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Failed to load your services', 'Error');
            }
        });
    }

    // ── Open / load ─────────────────────────────────────────────────────────
    manageItems(service: any) {
        this.selectedService = service;
        this.itemSearchQuery = '';
        this.categoryFilter = 'all';
        this.showOnlySelected = false;
        this.bulkPercent = null;
        this.errors = {};
        this.loadCatalog(service.service_id || service.id);
    }

    loadCatalog(serviceId: number) {
        if (!this.vendorId) return;
        this.loadingItems = true;
        this.items = [];
        this.apiService.getVendorCatalog(this.vendorId, serviceId).subscribe({
            next: (res: any) => {
                const data = res?.data || {};
                this.catalogKind = data.service?.kind === 'menu' ? 'menu' : 'service';
                this.items = (data.items || []).map((i: any) => ({
                    item_id: Number(i.item_id),
                    name: i.name,
                    description: i.description,
                    quantity_type: i.quantity_type,
                    category_name: i.category_name,
                    display_url: this.apiService.getImageUrl(i.display_url || i.image_url),
                    base_price: Number(i.base_price) || 0,
                    is_selected: Number(i.is_selected) ? 1 : 0,
                    priceInput: i.price_override !== null && i.price_override !== undefined ? Number(i.price_override) : null
                }));
                this.categories = this.catalogKind === 'menu'
                    ? [...new Set(this.items.map(i => i.category_name || 'Other'))]
                    : [];
                this.initialSnapshot = this.snapshot();
                this.loadingItems = false;
            },
            error: (err) => {
                this.loadingItems = false;
                this.toastr.error(err?.error?.message || 'Failed to load items for this service', 'Error');
            }
        });
    }

    trackItem(_: number, item: CatalogItem) {
        return item.item_id;
    }

    // ── Filtering ───────────────────────────────────────────────────────────
    get filteredItems(): CatalogItem[] {
        const q = this.itemSearchQuery.toLowerCase().trim();
        return this.items.filter(i =>
            (!q || i.name.toLowerCase().includes(q) || (i.category_name || '').toLowerCase().includes(q)) &&
            (this.categoryFilter === 'all' || (i.category_name || 'Other') === this.categoryFilter) &&
            (!this.showOnlySelected || i.is_selected)
        );
    }

    selectedInCategory(cat: string): number {
        return this.items.filter(i => i.is_selected && (i.category_name || 'Other') === cat).length;
    }

    get allVisibleSelected(): boolean {
        const v = this.filteredItems;
        return v.length > 0 && v.every(i => i.is_selected);
    }

    // ── Selection ───────────────────────────────────────────────────────────
    toggleItem(item: CatalogItem) {
        item.is_selected = item.is_selected ? 0 : 1;
        if (!item.is_selected) delete this.errors[item.item_id];
        else this.validateItem(item);
    }

    toggleAllVisible() {
        const target = this.allVisibleSelected ? 0 : 1;
        this.filteredItems.forEach(i => {
            i.is_selected = target;
            if (!target) delete this.errors[i.item_id];
        });
    }

    // ── Pricing ─────────────────────────────────────────────────────────────
    hasCustomPrice(item: CatalogItem): boolean {
        return item.priceInput !== null && item.priceInput !== '' && Number(item.priceInput) !== item.base_price;
    }

    effectivePrice(item: CatalogItem): number {
        return this.hasCustomPrice(item) && !this.errors[item.item_id] ? Number(item.priceInput) : item.base_price;
    }

    /** Percentage change vs platform price, e.g. +12 or -5. Null when unchanged. */
    priceChange(item: CatalogItem): number | null {
        if (!this.hasCustomPrice(item) || this.errors[item.item_id] || !item.base_price) return null;
        return Math.round(((Number(item.priceInput) - item.base_price) / item.base_price) * 1000) / 10;
    }

    onPriceChange(item: CatalogItem) {
        // Typing a price implies the vendor offers the item.
        if (item.priceInput !== null && item.priceInput !== '') item.is_selected = 1;
        this.validateItem(item);
    }

    resetPrice(item: CatalogItem) {
        item.priceInput = null;
        delete this.errors[item.item_id];
    }

    validateItem(item: CatalogItem): boolean {
        delete this.errors[item.item_id];
        if (!item.is_selected || item.priceInput === null || item.priceInput === '') return true;
        const n = Number(item.priceInput);
        if (!Number.isFinite(n) || n <= 0) this.errors[item.item_id] = 'Enter a price above ₹0';
        else if (n > MAX_PRICE) this.errors[item.item_id] = 'Max ₹1,00,00,000';
        else if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) this.errors[item.item_id] = 'Max 2 decimals';
        return !this.errors[item.item_id];
    }

    /** Raise or lower the price of all selected (visible) items by a percentage of the platform price. */
    applyBulkPercent() {
        const p = Number(this.bulkPercent);
        if (!Number.isFinite(p) || p === 0) {
            this.toastr.warning('Enter a percentage, e.g. 10 to increase or -10 to decrease');
            return;
        }
        if (p <= -100 || p > 500) {
            this.toastr.warning('Percentage must be between -99 and 500');
            return;
        }
        const targets = this.filteredItems.filter(i => i.is_selected);
        if (!targets.length) {
            this.toastr.warning('Select at least one item first');
            return;
        }
        targets.forEach(i => {
            i.priceInput = Math.max(Math.round(i.base_price * (1 + p / 100) * 100) / 100, 0.01);
            this.validateItem(i);
        });
        this.toastr.success(`${p > 0 ? 'Increased' : 'Decreased'} ${targets.length} price${targets.length === 1 ? '' : 's'} by ${Math.abs(p)}%`);
    }

    resetAllPrices() {
        this.items.forEach(i => { i.priceInput = null; });
        this.errors = {};
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    get selectedItemCount(): number {
        return this.items.filter(i => i.is_selected).length;
    }

    get customPricedCount(): number {
        return this.items.filter(i => i.is_selected && this.hasCustomPrice(i)).length;
    }

    get errorCount(): number {
        return Object.keys(this.errors).length;
    }

    get isDirty(): boolean {
        return this.snapshot() !== this.initialSnapshot;
    }

    private snapshot(): string {
        return JSON.stringify(this.items.filter(i => i.is_selected).map(i => [i.item_id, this.hasCustomPrice(i) ? Number(i.priceInput) : null]));
    }

    // ── Save / close ────────────────────────────────────────────────────────
    saveItems() {
        if (!this.vendorId || !this.selectedService || this.savingItems) return;
        const selected = this.items.filter(i => i.is_selected);
        selected.forEach(i => this.validateItem(i));
        if (this.errorCount) {
            this.showOnlySelected = true;
            this.toastr.warning(`Fix ${this.errorCount} price${this.errorCount === 1 ? '' : 's'} before saving`);
            return;
        }

        const payload = selected.map(i => ({
            item_id: i.item_id,
            price_override: this.hasCustomPrice(i) ? Number(i.priceInput) : null
        }));

        this.savingItems = true;
        this.apiService.saveVendorCatalog(this.vendorId, this.selectedService.service_id || this.selectedService.id, payload).subscribe({
            next: (res: any) => {
                this.savingItems = false;
                this.toastr.success(res?.message || 'Items saved', 'Success');
                this.loadVendorServices();
                this.closeItems(true);
            },
            error: (err) => {
                this.savingItems = false;
                const serverErrors = err?.error?.errors;
                if (serverErrors) {
                    Object.keys(serverErrors).forEach(k => this.errors[Number(k)] = serverErrors[k]);
                    this.showOnlySelected = true;
                }
                this.toastr.error(err?.error?.message || 'Failed to save items', 'Error');
            }
        });
    }

    closeItems(force = false) {
        if (this.savingItems) return;
        if (!force && this.isDirty && !confirm('Discard your unsaved changes?')) return;
        this.selectedService = null;
        this.items = [];
        this.errors = {};
    }
}
