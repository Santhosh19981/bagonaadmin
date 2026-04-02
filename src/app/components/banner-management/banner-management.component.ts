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
    isEditMode = false;
    editingBannerId: number | null = null;

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
        // First check if user is Master Admin to decide loading strategy
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            // If the user is a Master Admin (Vijay), we might want to see all banners 
            // but for now, we bind to their specific vendor ID or ID 25 as per user request
            this.vendorId = user.role === 'MASTER ADMIN' ? 25 : user.id; 
            
            this.loadBanners();
            this.loadServices();
        }
    }

    getServiceName(serviceId: any): string {
        if (!serviceId) return 'Global';
        const service = this.vendorServices.find(s => s.service_id == serviceId);
        return service ? service.name : 'Unknown Service';
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
        if (!this.vendorId) return;
        if (!this.isEditMode && !this.selectedFile) {
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
        
        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }

        if (this.isEditMode && this.editingBannerId) {
            this.apiService.updateBanner(this.editingBannerId, formData).subscribe({
                next: (res: any) => {
                    this.adding = false;
                    if (res.status) {
                        this.toastr.success('Banner updated successfully', 'Success');
                        this.loadBanners();
                        this.closeModal();
                    }
                },
                error: (err) => {
                    this.adding = false;
                    this.toastr.error('Failed to update banner', 'Error');
                }
            });
        } else {
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
    }

    editBanner(banner: any) {
        this.isEditMode = true;
        this.editingBannerId = banner.id;
        this.newBanner = {
            title: banner.title,
            description: banner.description,
            service_id: banner.service_id || '',
            link_url: banner.link_url,
            display_url: banner.image_url
        };
        this.showAddModal = true;
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
        this.isEditMode = false;
        this.editingBannerId = null;
        this.newBanner = { title: '', description: '', service_id: '', link_url: '', image: null, display_url: null };
        this.selectedFile = null;
    }
}
