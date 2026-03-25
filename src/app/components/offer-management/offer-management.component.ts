import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.scss'
})
export class OfferManagementComponent implements OnInit {
  vendorId: number | null = null;
  offers: any[] = [];
  vendorServices: any[] = [];
  loading = false;
  submitting = false;

  showModal = false;
  isEdit = false;
  currentOffer: any = this.getEmptyOffer();

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.vendorId = user.id;
      this.loadOffers();
      this.loadServices();
    }
  }

  getEmptyOffer() {
    return {
      id: null,
      service_id: '',
      coupon_code: '',
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      usage_limit_per_user: 1,
      is_active: 1
    };
  }

  loadOffers() {
    if (!this.vendorId) return;
    this.loading = true;
    this.apiService.getOffersByVendor(this.vendorId).subscribe({
      next: (res: any) => {
        this.offers = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load offers');
      }
    });
  }

  loadServices() {
    if (!this.vendorId) return;
    this.apiService.getVendorServicesList(this.vendorId).subscribe({
      next: (res: any) => {
        this.vendorServices = res.data || [];
      }
    });
  }

  openAddModal() {
    this.isEdit = false;
    this.currentOffer = this.getEmptyOffer();
    this.showModal = true;
  }

  openEditModal(offer: any) {
    this.isEdit = true;
    this.currentOffer = { ...offer, 
        start_date: offer.start_date ? new Date(offer.start_date).toISOString().split('T')[0] : '',
        end_date: offer.end_date ? new Date(offer.end_date).toISOString().split('T')[0] : ''
    };
    this.showModal = true;
  }

  saveOffer() {
    if (!this.vendorId) return;
    if (!this.currentOffer.coupon_code || !this.currentOffer.title) {
        this.toastr.warning('Please fill required fields');
        return;
    }

    this.submitting = true;
    const payload = { ...this.currentOffer, vendor_id: this.vendorId };

    const obs = this.isEdit 
        ? this.apiService.updateOffer(this.currentOffer.id, payload)
        : this.apiService.addOffer(payload);

    obs.subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.status) {
          this.toastr.success(`Offer ${this.isEdit ? 'updated' : 'added'} successfully`);
          this.loadOffers();
          this.closeModal();
        }
      },
      error: () => {
        this.submitting = false;
        this.toastr.error('Operation failed');
      }
    });
  }

  deleteOffer(id: number) {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    this.apiService.deleteOffer(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.toastr.success('Offer deleted');
          this.loadOffers();
        }
      }
    });
  }

  toggleStatus(offer: any) {
    const newStatus = offer.is_active ? 0 : 1;
    this.apiService.updateOffer(offer.id, { ...offer, is_active: newStatus }).subscribe({
        next: () => {
            offer.is_active = newStatus;
            this.toastr.success('Status updated');
        }
    });
  }

  closeModal() {
    this.showModal = false;
    this.currentOffer = this.getEmptyOffer();
  }
}
