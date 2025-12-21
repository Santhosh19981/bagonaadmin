import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-service-items',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './service-items.component.html',
  styleUrls: ['./service-items.component.scss'],
})
export class ServiceItemsComponent implements OnInit {

  allServiceItems: any[] = [];
  filteredServiceItems: any[] = [];
  paginatedServiceItems: any[] = [];
  services: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedItem: any = null;
  imagePreviewUrl: string | null = null;

  // Dropdown State
  showServiceDropdown: boolean = false;
  serviceSearchQuery: string = '';
  filteredServices: any[] = [];
  selectedServiceName: string = '';

  // Delete Modal
  showDeleteConfirm: boolean = false;
  itemIdToDelete: number | null = null;

  formData: any = {
    service_id: '',
    name: '',
    description: '',
    quantity_type: '',
    price: '',
    image: null
  };

  defaultImage = "https://cdn-icons-png.flaticon.com/512/3569/3569429.png";

  constructor(private api: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadServices();
    this.loadServiceItems();
  }

  // LOAD SERVICES FOR DROPDOWN
  loadServices() {
    this.api.getServices().subscribe((res: any) => {
      this.services = res.data || [];
      this.filteredServices = [...this.services];
    });
  }

  toggleServiceDropdown() {
    this.showServiceDropdown = !this.showServiceDropdown;
    if (this.showServiceDropdown) {
      this.serviceSearchQuery = '';
      this.filteredServices = [...this.services];
    }
  }

  filterServices(query: string) {
    this.serviceSearchQuery = query;
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter(s => s.name.toLowerCase().includes(q));
    }
  }

  selectService(service: any) {
    this.formData.service_id = service.service_id;
    this.selectedServiceName = service.name;
    this.showServiceDropdown = false;
  }

  // LOAD SERVICE ITEMS LIST
  loadServiceItems() {
    this.api.getServiceItems().subscribe({
      next: (res: any) => {
        this.allServiceItems = res.data?.map((item: any) => ({
          ...item,
          image: item.image_url
        })) || [];
        this.applyFilter('');
      },
      error: (err) => {
        console.error("Error loading service items:", err);
        this.allServiceItems = [];
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
      this.filteredServiceItems = [...this.allServiceItems];
    } else {
      this.filteredServiceItems = this.allServiceItems.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.service_name && item.service_name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredServiceItems.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.updatePaginatedItems();
  }

  updatePaginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedServiceItems = this.filteredServiceItems.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedItems();
    }
  }

  toggleForm(item?: any) {
    this.showForm = !this.showForm;
    this.imagePreviewUrl = null;

    if (item) {
      this.selectedItem = item;
      this.formData = {
        service_id: item.service_id,
        name: item.name,
        description: item.description || '',
        quantity_type: item.quantity_type || '',
        price: item.price || '',
        image: null,
      };
      this.imagePreviewUrl = item.image;

      const matchedService = this.services.find(s => s.service_id === item.service_id);
      this.selectedServiceName = matchedService ? matchedService.name : 'Link to a service...';
    } else {
      this.selectedItem = null;
      this.selectedServiceName = 'Link to a service...';
      this.formData = {
        service_id: '',
        name: '',
        description: '',
        quantity_type: '',
        price: '',
        image: null
      };
    }
  }

  onImageChange(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.formData.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageError(e: any) {
    e.target.src = this.defaultImage;
  }

  // SAVE SERVICE ITEM (CREATE / UPDATE)
  saveServiceItem() {
    const fd = new FormData();
    fd.append('service_id', this.formData.service_id);
    fd.append('name', this.formData.name);
    fd.append('description', this.formData.description);
    fd.append('quantity_type', this.formData.quantity_type);
    fd.append('price', this.formData.price);

    if (this.formData.image instanceof File) {
      fd.append('image', this.formData.image);
    }

    if (this.selectedItem) {
      if (this.selectedItem.image) {
        fd.append('existingImage', this.selectedItem.image);
      }
      this.api.updateServiceItem(this.selectedItem.service_item_id, fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Service item updated!");
          this.showForm = false;
          this.loadServiceItems();
        },
        error: (err) => {
          this.toastr.error(err.message || "Update failed!");
        }
      });
    } else {
      this.api.createServiceItem(fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Service item created!");
          this.showForm = false;
          this.loadServiceItems();
        },
        error: (err) => {
          this.toastr.error(err.message || "Creation failed!");
        }
      });
    }
  }

  // DELETE SERVICE ITEM
  deleteServiceItem(id: number) {
    this.itemIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.itemIdToDelete) {
      this.api.deleteServiceItem(this.itemIdToDelete).subscribe({
        next: () => {
          this.toastr.success("Service item removed");
          this.loadServiceItems();
          this.cancelDelete();
        },
        error: () => {
          this.toastr.error("Failed to delete item");
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.itemIdToDelete = null;
  }
}
