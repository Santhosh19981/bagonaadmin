import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.scss',
})
export class MenuItemsComponent implements OnInit {

  allMenuItems: any[] = [];
  filteredMenuItems: any[] = [];
  paginatedMenuItems: any[] = [];

  // API Base URL - update this to your production URL when deploying
  apiBaseUrl: string = "https://bhagona-backend-v2.vercel.app";

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedMenuItem: any = null;
  imagePreviewUrl: string | null = null;

  // Delete Modal
  showDeleteConfirm: boolean = false;
  itemIdToDelete: number | null = null;

  newMenuItem: any = {
    name: '',
    description: '',
    price: '',
    type: 'Veg',
    image: null
  };

  defaultItemImage = "https://cdn-icons-png.flaticon.com/512/3565/3565407.png";

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadMenuItems();
  }

  // LOAD MENU ITEMS
  loadMenuItems() {
    this.apiService.getMenuItems().subscribe({
      next: (res: any) => {
        this.allMenuItems = Array.isArray(res?.data) ? res.data.map((item: any) => ({
          ...item,
          image: item.image_url || item.image // Map image_url to image
        })) : [];
        this.applyFilter('');
      },
      error: (err) => {
        console.error("Error loading menu items:", err);
        this.allMenuItems = [];
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
      this.filteredMenuItems = [...this.allMenuItems];
    } else {
      this.filteredMenuItems = this.allMenuItems.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredMenuItems.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.updatePaginatedItems();
  }

  updatePaginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMenuItems = this.filteredMenuItems.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedItems();
    }
  }

  onImageChange(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.newMenuItem.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageError(event: any) {
    event.target.src = this.defaultItemImage;
  }

  // Determine the correct image source for display
  getImageSrc(imageUrl: string | null): string {
    if (!imageUrl) return this.defaultItemImage;
    if (imageUrl.startsWith('data:')) return imageUrl; // Return base64 preview as is
    if (imageUrl.startsWith('http')) return imageUrl; // Original full URL

    // Check if it's a local file path (e.g., from an old DB entry or misconfiguration)
    if (imageUrl.includes(':/') || imageUrl.includes(':\\')) {
      return this.defaultItemImage;
    }

    return this.apiBaseUrl + imageUrl; // Prefix relative server path with API URL
  }

  toggleForm(item?: any) {
    this.showForm = !this.showForm;
    this.imagePreviewUrl = null;

    if (item) {
      this.selectedMenuItem = { ...item };
      this.newMenuItem = {
        ...item,
        description: item.description || '',
        price: item.price || '',
        image: null
      };

      // Map veg/nonveg to type for the dropdown
      if (item.veg === 1 || item.veg === '1') {
        this.newMenuItem.type = 'Veg';
      } else if (item.nonveg === 1 || item.nonveg === '1') {
        this.newMenuItem.type = 'Non-Veg';
      }

      this.imagePreviewUrl = item.image;
    } else {
      this.selectedMenuItem = null;
      this.newMenuItem = { name: '', description: '', price: '', type: 'Veg', image: null };
    }
  }

  // SAVE MENU ITEM (CREATE OR UPDATE)
  saveMenuItem() {
    const fd = new FormData();
    fd.append('name', this.newMenuItem.name);
    fd.append('description', this.newMenuItem.description || '');
    fd.append('price', this.newMenuItem.price);

    // Map type back to veg/nonveg
    fd.append('veg', this.newMenuItem.type === 'Veg' ? '1' : '0');
    fd.append('nonveg', this.newMenuItem.type === 'Non-Veg' ? '1' : '0');

    if (this.newMenuItem.image instanceof File) {
      fd.append('image', this.newMenuItem.image);
    }

    if (this.selectedMenuItem) {
      if (this.selectedMenuItem.image) {
        fd.append('existingImage', this.selectedMenuItem.image);
      }

      this.apiService.updateMenuItem(this.selectedMenuItem.menu_item_id, fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Menu item updated!");
          this.showForm = false;
          this.loadMenuItems();
        },
        error: (err) => {
          this.toastr.error(err.message || "Update failed!");
        }
      });

    } else {
      this.apiService.createMenuItem(fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Menu item created!");
          this.showForm = false;
          this.loadMenuItems();
        },
        error: (err) => {
          this.toastr.error(err.message || "Creation failed!");
        }
      });
    }
  }

  // DELETE
  deleteMenuItem(id: number) {
    this.itemIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.itemIdToDelete) {
      this.apiService.deleteMenuItem(this.itemIdToDelete).subscribe({
        next: () => {
          this.toastr.success("Menu item deleted");
          this.loadMenuItems();
          this.cancelDelete();
        },
        error: (err) => {
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
