import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-menu-category',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './menu-category.component.html',
    styleUrl: './menu-category.component.scss'
})
export class MenuCategoryComponent implements OnInit {
    allCategories: any[] = [];
    filteredCategories: any[] = [];
    paginatedCategories: any[] = [];

    // API Base URL
    apiBaseUrl: string = "https://bhagona-backend-v2.vercel.app";

    // Pagination
    currentPage: number = 1;
    itemsPerPage: number = 8;
    totalPages: number = 1;

    // State
    showForm = false;
    selectedCategory: any = null;
    imagePreviewUrl: string | null = null;
    isNewImageSelected: boolean = false;

    // Delete Modal
    showDeleteConfirm: boolean = false;
    categoryIdToDelete: number | null = null;

    newCategory: any = {
        name: '',
        status: 'active',
        image: null,
        image_url: ''
    };

    defaultCategoryImage = "https://cdn-icons-png.flaticon.com/512/3565/3565407.png";

    constructor(private apiService: ApiService, private toastr: ToastrService) { }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.apiService.getMenuCategories().subscribe({
            next: (res: any) => {
                this.allCategories = Array.isArray(res?.data) ? res.data : [];
                this.applyFilter('');
            },
            error: (err) => {
                console.error("❌ Error loading categories:", err);
                this.toastr.error("Failed to load categories");
            }
        });
    }

    onSearch(query: string) {
        this.applyFilter(query);
    }

    applyFilter(query: string) {
        const q = query.toLowerCase().trim();
        if (!q) {
            this.filteredCategories = [...this.allCategories];
        } else {
            this.filteredCategories = this.allCategories.filter(cat =>
                cat.name.toLowerCase().includes(q)
            );
        }
        this.currentPage = 1;
        this.calculatePagination();
    }

    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
        if (this.totalPages === 0) this.totalPages = 1;
        this.updatePaginatedCategories();
    }

    updatePaginatedCategories() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.paginatedCategories = this.filteredCategories.slice(start, end);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedCategories();
        }
    }

    onToggleChange(event: any) {
        this.newCategory.status = event.target.checked ? 'active' : 'inactive';
    }

    toggleForm(category?: any) {
        this.showForm = !this.showForm;
        this.imagePreviewUrl = null;
        this.isNewImageSelected = false;

        if (category) {
            this.selectedCategory = { ...category };
            this.newCategory = { ...category, image: null };
            this.imagePreviewUrl = category.image || category.image_url;
        } else {
            this.selectedCategory = null;
            this.newCategory = {
                name: '',
                status: 'active',
                image: null,
                image_url: ''
            };
        }
    }

    onImageError(event: any) {
        event.target.src = this.defaultCategoryImage;
    }

    onImageChange(e: any) {
        const file = e.target.files[0];
        if (file) {
            this.newCategory.image = file;
            this.isNewImageSelected = true;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreviewUrl = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    getImageSrc(imageUrl: string | null): string {
        if (!imageUrl) return this.defaultCategoryImage;
        if (imageUrl.startsWith('data:')) return imageUrl;
        if (imageUrl.startsWith('http')) return imageUrl;

        if (imageUrl.includes(':/') || imageUrl.includes(':\\')) {
            return this.defaultCategoryImage;
        }

        return this.apiBaseUrl + imageUrl;
    }

    saveCategory() {
        const fd = new FormData();
        fd.append('name', this.newCategory.name);
        fd.append('status', this.newCategory.status);

        if (this.newCategory.image instanceof File) {
            fd.append('image', this.newCategory.image);
        }

        if (this.selectedCategory) {
            if (!this.isNewImageSelected) {
                fd.append('existingImage', this.selectedCategory.image || this.selectedCategory.image_url);
            }

            this.apiService.updateMenuCategory(this.selectedCategory.id, fd).subscribe({
                next: (res: any) => {
                    this.toastr.success(res.message || "Category updated!");
                    this.showForm = false;
                    this.loadCategories();
                },
                error: (err) => this.toastr.error(err.message || "Update failed")
            });
        } else {
            this.apiService.createMenuCategory(fd).subscribe({
                next: (res: any) => {
                    this.toastr.success(res.message || "Category created!");
                    this.showForm = false;
                    this.loadCategories();
                },
                error: (err) => this.toastr.error(err.message || "Creation failed")
            });
        }
    }

    deleteCategory(id: number) {
        this.categoryIdToDelete = id;
        this.showDeleteConfirm = true;
    }

    confirmDelete() {
        if (this.categoryIdToDelete) {
            this.apiService.deleteMenuCategory(this.categoryIdToDelete).subscribe({
                next: () => {
                    this.toastr.success("Category deleted");
                    this.loadCategories();
                    this.cancelDelete();
                },
                error: () => this.toastr.error("Delete failed")
            });
        }
    }

    cancelDelete() {
        this.showDeleteConfirm = false;
        this.categoryIdToDelete = null;
    }
}
