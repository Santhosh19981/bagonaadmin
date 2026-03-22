import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-profile-management',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './profile-management.component.html',
    styleUrl: './profile-management.component.scss'
})
export class ProfileManagementComponent implements OnInit {
    vendorId: number | null = null;
    profileData: any = {
        name: '',
        email: '',
        mobile: '',
        businessname: '',
        address: '',
        describe: '',
        image: null,
        display_url: null
    };
    loading = false;
    saving = false;
    selectedFile: File | null = null;

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.vendorId = user.id;
            this.loadProfile();
        }
    }

    loadProfile() {
        if (!this.vendorId) return;
        this.loading = true;
        this.apiService.getUserProfile(this.vendorId).subscribe({
            next: (res: any) => {
                if (res.status) {
                    this.profileData = res.data;
                }
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Failed to load profile', 'Error');
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.profileData.display_url = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfile() {
        if (!this.vendorId) return;
        this.saving = true;

        const formData = new FormData();
        formData.append('name', this.profileData.name);
        formData.append('email', this.profileData.email);
        formData.append('mobile', this.profileData.mobile);
        formData.append('businessname', this.profileData.businessname);
        formData.append('address', this.profileData.address);
        formData.append('describe', this.profileData.describe);

        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        } else {
            formData.append('existingImage', this.profileData.image);
        }

        this.apiService.updateProfile(this.vendorId, formData).subscribe({
            next: (res: any) => {
                this.saving = false;
                if (res.status) {
                    this.toastr.success('Profile updated successfully', 'Success');
                    // Update local storage name if changed
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.name = this.profileData.name;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            },
            error: () => {
                this.saving = false;
                this.toastr.error('Failed to update profile', 'Error');
            }
        });
    }
}
