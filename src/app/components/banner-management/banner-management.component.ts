import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-banner-management',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './banner-management.component.html',
    styleUrl: './banner-management.component.scss'
})
export class BannerManagementComponent implements OnInit {
    vendorId: number | null = null;
    banners: any[] = [];
    vendorServices: any[] = []; // List of services for this vendor
    loading = false;
    adding = false;

    newBanner: any = {
        title: '',
        description: '',
        service_id: '',
        link_url: '',
        image: null,
        display_url: null
    };
    selectedFile: File | null = null;
    showAddModal = false;

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.vendorId = user.id;
            this.loadBanners();
            this.loadServices();
        }
    }

    loadServices() {
        if (!this.vendorId) return;
        this.apiService.getVendorServicesList(this.vendorId).subscribe({
            next: (res: any) => {
                this.vendorServices = res.data || [];
            },
            error: () => {
                console.error('Failed to load vendor services');
            }
        });
    }

    loadBanners() {
        if (!this.vendorId) return;
        this.loading = true;
        this.apiService.getVendorBanners(this.vendorId).subscribe({
            next: (res: any) => {
                this.banners = res.data || [];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Failed to load banners', 'Error');
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.newBanner.display_url = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    addBanner() {
        if (!this.vendorId || !this.selectedFile) {
            this.toastr.warning('Please select an image', 'Warning');
            return;
        }

        this.adding = true;
        const formData = new FormData();
        formData.append('vendor_id', this.vendorId.toString());
        formData.append('service_id', this.newBanner.service_id || '');
        formData.append('title', this.newBanner.title);
        formData.append('description', this.newBanner.description);
        formData.append('link_url', this.newBanner.link_url);
        formData.append('image', this.selectedFile);

        this.apiService.addBanner(formData).subscribe({
            next: (res: any) => {
                this.adding = false;
                if (res.status) {
                    this.toastr.success('Banner added successfully', 'Success');
                    this.loadBanners();
                    this.closeModal();
                }
            },
            error: () => {
                this.adding = false;
                this.toastr.error('Failed to add banner', 'Error');
            }
        });
    }

    deleteBanner(id: number) {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        this.apiService.deleteBanner(id).subscribe({
            next: (res: any) => {
                if (res.status) {
                    this.toastr.success('Banner deleted', 'Success');
                    this.loadBanners();
                }
            },
            error: () => {
                this.toastr.error('Failed to delete banner', 'Error');
            }
        });
    }

    closeModal() {
        this.showAddModal = false;
        this.newBanner = { title: '', description: '', service_id: '', link_url: '', image: null, display_url: null };
        this.selectedFile = null;
    }
}
