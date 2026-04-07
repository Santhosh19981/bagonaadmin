import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent implements OnInit {

  allVendors: any[] = [];
  filteredVendors: any[] = [];
  paginatedVendors: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedVendor: any = null;
  servicesList: any[] = [];
  selectedServices: any[] = [];
  dropdownOpen = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  newVendor: any = {
    name: '',
    phone: '',
    mobile: '',
    email: '',
    experience: '',
    address: '',
    businessname: '',
    describe: '',
    services: ''
  };

  constructor(private api: ApiService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadVendors();
    this.loadAllServices();
  }

  loadAllServices() {
    this.api.getServices().subscribe({
      next: (res: any) => {
        if (res.status === 'success' || res.status === true) {
          this.servicesList = res.data || [];
        }
      },
      error: (err) => console.error('Error loading services:', err)
    });
  }

  loadVendors() {
    this.api.getVendors().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.allVendors = (res.data || []).map((v: any) => ({
            ...v,
            image: this.api.getImageUrl(v.display_url || v.image || null)
          }));
          this.applyFilter('');
        }
      },
      error: (err) => {
        this.toastr.error("Failed to load vendors");
        console.error(err);
      }
    });
  }

  onSearch(query: string) {
    this.applyFilter(query);
  }

  applyFilter(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredVendors = [...this.allVendors];
    } else {
      this.filteredVendors = this.allVendors.filter(v =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.businessname && v.businessname.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.mobile && v.mobile.includes(q))
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredVendors.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.updatePaginatedItems();
  }

  updatePaginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedVendors = this.filteredVendors.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedItems();
    }
  }

  toggleForm(vendor?: any) {
    this.selectedVendor = vendor || null;
    this.dropdownOpen = false;
    this.selectedFile = null;
    if (vendor) {
      this.newVendor = { ...vendor };
      this.imagePreview = vendor.image || null;
      // Handle services - they come as comma separated IDs in this.newVendor.services
      if (typeof this.newVendor.services === 'string' && this.newVendor.services) {
        const serviceIds = this.newVendor.services.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        this.selectedServices = this.servicesList.filter(s => serviceIds.includes(s.service_id));
      } else {
        this.selectedServices = [];
      }
    } else {
      this.newVendor = {
        name: '',
        mobile: '',
        email: '',
        experience: '',
        address: '',
        businessname: '',
        describe: '',
        services: ''
      };
      this.imagePreview = null;
      this.selectedServices = [];
    }
    this.showForm = !this.showForm;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleService(service: any) {
    const index = this.selectedServices.findIndex(s => s.service_id === service.service_id);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(service);
    }
  }

  removeService(service: any) {
    this.selectedServices = this.selectedServices.filter(s => s.service_id !== service.service_id);
  }

  isServiceSelected(service: any): boolean {
    return this.selectedServices.some(s => s.service_id === service.service_id);
  }

  getSelectedServiceNames(): string {
    return this.selectedServices.map(s => s.name).join(', ');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getServiceNamesByIds(servicesString: string): string[] {
    if (!servicesString) return [];

    // Check if it's already names or IDs
    const parts = servicesString.split(',').map(s => s.trim()).filter(s => s);

    // If they are IDs, map them to names
    if (parts.length > 0 && !isNaN(parseInt(parts[0]))) {
      const ids = parts.map(p => parseInt(p));
      return this.servicesList
        .filter(s => ids.includes(s.service_id))
        .map(s => s.name);
    }

    // If they are already names or unknown, return as is
    return parts;
  }

  toggleActive(id: any, currentStatus: number) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    this.api.updateActiveStatus(id, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Vendor status updated to ${newStatus === 1 ? 'Active' : 'Inactive'} successfully`);
        this.loadVendors();
      },
      error: () => this.toastr.error("Status update failed")
    });
  }

  saveVendor(): void {
    if (!this.newVendor.name || !this.newVendor.businessname || !this.newVendor.email || !this.newVendor.mobile) {
      this.toastr.warning("Please fill all required fields");
      return;
    }

    const serviceIds = this.selectedServices.map(s => s.service_id);
    this.newVendor.services = serviceIds.join(', ');

    const formData = new FormData();
    Object.keys(this.newVendor).forEach(key => {
      // Don't append null or undefined
      if (this.newVendor[key] !== null && this.newVendor[key] !== undefined) {
        formData.append(key, this.newVendor[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.selectedVendor) {
      // Update
      this.api.updateVendor(this.selectedVendor.user_id, formData).subscribe({
        next: (res: any) => {
          if (res.status) {
            // Also sync mappings - use selectedVendor.user_id directly
            this.api.syncVendorServices({ vendor_id: this.selectedVendor.user_id, service_ids: serviceIds }).subscribe({
              next: () => {
                this.toastr.success("Vendor updated successfully");
                this.loadVendors();
                this.toggleForm();
              },
              error: (err) => {
                console.error(err);
                this.toastr.error("Vendor info updated, but services sync failed");
              }
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error("Failed to update vendor");
        }
      });
    } else {
      // Create
      formData.append('role', '3'); // Vendor role
      this.api.registerChef(formData).subscribe({
        next: (res: any) => {
          this.toastr.success("Vendor created successfully");
          this.loadVendors();
          this.toggleForm();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error?.message || "Failed to create vendor");
        }
      });
    }
  }
}