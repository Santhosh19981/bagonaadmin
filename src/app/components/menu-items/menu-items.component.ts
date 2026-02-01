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
  categories: any[] = [];
  allSubcategories: any[] = [];
  subcategories: any[] = [];

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
    menu_category_id: '',
    menu_subcategory_id: '',
    status: 'active',
    image: null
  };

  defaultItemImage = "https://cdn-icons-png.flaticon.com/512/3565/3565407.png";

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadMenuItems();
    this.loadCategories();
    this.loadAllSubcategories();
  }

  loadAllSubcategories() {
    this.apiService.getMenuSubcategories().subscribe({
      next: (res: any) => {
        this.allSubcategories = Array.isArray(res?.data) ? res.data : [];
        // If we're already editing an item, filter subcategories now
        if (this.newMenuItem && this.newMenuItem.menu_category_id) {
          this.onCategoryChange();
        }
      }
    });
  }

  loadCategories() {
    this.apiService.getMenuCategories().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res?.data) ? res.data : [];
      }
    });
  }

  onCategoryChange() {
    if (this.newMenuItem.menu_category_id) {
      // Find selected category to infer dietary type
      const selectedCat = this.categories.find(c => c.id == this.newMenuItem.menu_category_id);
      if (selectedCat) {
        const catName = selectedCat.name.toLowerCase();
        if (catName.includes('non') || catName.includes('meat') || catName.includes('chicken') || catName.includes('mutton') || catName.includes('egg')) {
          this.newMenuItem.veg = 0;
          this.newMenuItem.nonveg = 1;
        } else {
          this.newMenuItem.veg = 1;
          this.newMenuItem.nonveg = 0;
        }
      }

      // Filter subcategories that belong to the selected category
      this.subcategories = this.allSubcategories.filter(sub =>
        sub.categories && sub.categories.some((c: any) => c.id == this.newMenuItem.menu_category_id)
      );
    } else {
      this.subcategories = [];
      this.newMenuItem.veg = 0;
      this.newMenuItem.nonveg = 0;
    }

    // Reset subcategory if not in the new list (using loose equality for safety)
    if (this.newMenuItem.menu_subcategory_id && !this.subcategories.find(s => s.id == this.newMenuItem.menu_subcategory_id)) {
      this.newMenuItem.menu_subcategory_id = '';
    }
  }

  // LOAD MENU ITEMS
  loadMenuItems() {
    this.apiService.getMenuItems().subscribe({
      next: (res: any) => {
        this.allMenuItems = Array.isArray(res?.data) ? res.data : [];
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

  onStatusToggle(event: any) {
    this.newMenuItem.status = event.target.checked ? 'active' : 'inactive';
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
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/menu-items/image')) return this.apiBaseUrl + imageUrl;

    return this.apiBaseUrl + imageUrl;
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
        menu_category_id: item.menu_category_id || '',
        menu_subcategory_id: item.menu_subcategory_id || '',
        status: item.status || 'active',
        image: null
      };

      if (this.newMenuItem.menu_category_id) {
        this.onCategoryChange();
      }

      this.imagePreviewUrl = item.display_url || item.image_url;
    } else {
      this.selectedMenuItem = null;
      this.newMenuItem = {
        name: '',
        description: '',
        price: '',
        menu_category_id: '',
        menu_subcategory_id: '',
        status: 'active',
        image: null
      };
      this.subcategories = [];
    }
  }

  // SAVE MENU ITEM (CREATE OR UPDATE)
  saveMenuItem() {
    const fd = new FormData();
    fd.append('name', this.newMenuItem.name);
    fd.append('description', this.newMenuItem.description || '');
    fd.append('price', this.newMenuItem.price);
    fd.append('menu_category_id', this.newMenuItem.menu_category_id || '');
    fd.append('menu_subcategory_id', this.newMenuItem.menu_subcategory_id || '');
    fd.append('status', this.newMenuItem.status);

    if (this.newMenuItem.image instanceof File) {
      fd.append('image', this.newMenuItem.image);
    }

    if (this.selectedMenuItem) {
      if (!this.newMenuItem.image) {
        fd.append('existingImage', this.selectedMenuItem.image_url || '');
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
