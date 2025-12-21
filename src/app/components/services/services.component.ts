import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {

  allServices: any[] = [];
  filteredServices: any[] = [];
  paginatedServices: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedService: any = null;
  imagePreviewUrl: string | null = null;

  // Delete Modal
  showDeleteConfirm: boolean = false;
  serviceIdToDelete: number | null = null;

  newService: any = {
    name: '',
    description: '',
    status: 'active',
    unit_id: '',
    image: null
  };

  defaultServiceImage = "https://cdn-icons-png.flaticon.com/512/1067/1067561.png";

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadServices();
  }

  // ---------------------- LOAD SERVICES ----------------------
  loadServices() {
    this.apiService.getServices().subscribe({
      next: (res: any) => {
        this.allServices = Array.isArray(res?.data) ? res.data : [];
        this.applyFilter('');
      },
      error: (err) => {
        console.error("❌ Error loading services:", err);
        this.allServices = [];
        this.applyFilter('');
      }
    });
  }

  onSearch(query: string) {
    this.applyFilter(query);
  }

  applyFilter(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredServices = [...this.allServices];
    } else {
      this.filteredServices = this.allServices.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredServices.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.updatePaginatedServices();
  }

  updatePaginatedServices() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedServices = this.filteredServices.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedServices();
    }
  }

  // ---------------------- TOGGLE FORM ----------------------
  toggleForm(service?: any) {
    this.showForm = !this.showForm;
    this.imagePreviewUrl = null;

    if (service) {
      this.selectedService = { ...service };
      this.newService = {
        ...service,
        image: null
      };
      this.imagePreviewUrl = service.image_data;
    } else {
      this.selectedService = null;
      this.newService = {
        name: '',
        description: '',
        status: 'active',
        unit_id: '',
        image: null
      };
    }
  }

  onImageError(event: any) {
    event.target.src = this.defaultServiceImage;
  }

  // ---------------------- IMAGE UPLOAD WITH PREVIEW ----------------------
  onImageChange(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.newService.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ---------------------- SAVE (CREATE / UPDATE) ----------------------
  saveService() {
    const fd = new FormData();

    fd.append('name', this.newService.name);
    fd.append('description', this.newService.description);
    fd.append('status', this.newService.status);
    fd.append('unit_id', this.newService.unit_id);

    if (this.newService.image instanceof File) {
      fd.append('image', this.newService.image);
    }

    if (this.selectedService) {
      fd.append('existingImage', this.selectedService.image_data);

      this.apiService.updateService(this.selectedService.service_id, fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Service updated successfully!");
          this.showForm = false;
          this.loadServices();
        },
        error: (err) => {
          this.toastr.error(err.message || "Update failed!");
        }
      });

    } else {
      this.apiService.createService(fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Service created successfully!");
          this.showForm = false;
          this.loadServices();
        },
        error: (err) => {
          this.toastr.error(err.message || "Create failed!");
        }
      });
    }
  }

  // ---------------------- CUSTOM DELETE FLOW ----------------------
  deleteService(id: number) {
    this.serviceIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.serviceIdToDelete) {
      this.apiService.deleteService(this.serviceIdToDelete).subscribe({
        next: () => {
          this.toastr.success("Service deleted successfully");
          this.loadServices();
          this.cancelDelete();
        },
        error: () => {
          this.toastr.error("Failed to delete service");
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.serviceIdToDelete = null;
  }

  // ---------------------- TOGGLE ACTIVE/INACTIVE ----------------------
  onToggleChange(event: any) {
    const isChecked = event.target.checked;
    this.newService.status = isChecked ? 'active' : 'inactive';
  }
}
