import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-menu-subcategory',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './menu-subcategory.component.html',
    styleUrl: './menu-subcategory.component.scss'
})
export class MenuSubcategoryComponent implements OnInit {
    allSubcategories: any[] = [];
    filteredSubcategories: any[] = [];
    paginatedSubcategories: any[] = [];
    categories: any[] = []; // To hold parent categories for the multi-select

    // API Base URL
    apiBaseUrl: string = "https://bhagona-backend-v2.vercel.app";

    // Pagination
    currentPage: number = 1;
    itemsPerPage: number = 8;
    totalPages: number = 1;

    // State
    showForm = false;
    selectedSubcategory: any = null;
    imagePreviewUrl: string | null = null;
    isNewImageSelected: boolean = false;

    // Delete Modal
    showDeleteConfirm: boolean = false;
    subcategoryIdToDelete: number | null = null;

    newSubcategory: any = {
        name: '',
        category_ids: [],
        status: 'active',
        image: null,
        image_url: ''
    };

    defaultSubcategoryImage = "https://cdn-icons-png.flaticon.com/512/3565/3565407.png";

    constructor(private apiService: ApiService, private toastr: ToastrService) { }

    ngOnInit() {
        this.loadSubcategories();
        this.loadCategories();
    }

    loadCategories() {
        this.apiService.getMenuCategories().subscribe({
            next: (res: any) => {
                this.categories = Array.isArray(res?.data) ? res.data : [];
            }
        });
    }

    loadSubcategories() {
        this.apiService.getMenuSubcategories().subscribe({
            next: (res: any) => {
                this.allSubcategories = Array.isArray(res?.data) ? res.data : [];
                this.applyFilter('');
            },
            error: (err) => {
                console.error("❌ Error loading subcategories:", err);
                this.toastr.error("Failed to load subcategories");
            }
        });
    }

    onSearch(query: string) {
        this.applyFilter(query);
    }

    applyFilter(query: string) {
        const q = query.toLowerCase().trim();
        if (!q) {
            this.filteredSubcategories = [...this.allSubcategories];
        } else {
            this.filteredSubcategories = this.allSubcategories.filter(sub =>
                sub.name.toLowerCase().includes(q) ||
                (sub.categories && sub.categories.some((c: any) => c.name.toLowerCase().includes(q)))
            );
        }
        this.currentPage = 1;
        this.calculatePagination();
    }

    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredSubcategories.length / this.itemsPerPage);
        if (this.totalPages === 0) this.totalPages = 1;
        this.updatePaginatedSubcategories();
    }

    updatePaginatedSubcategories() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.paginatedSubcategories = this.filteredSubcategories.slice(start, end);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedSubcategories();
        }
    }

    onToggleChange(event: any) {
        this.newSubcategory.status = event.target.checked ? 'active' : 'inactive';
    }

    onCategorySelect(catId: any, event: any) {
        const checked = event.target.checked;
        if (checked) {
            if (!this.newSubcategory.category_ids.includes(catId)) {
                this.newSubcategory.category_ids.push(catId);
            }
        } else {
            this.newSubcategory.category_ids = this.newSubcategory.category_ids.filter((id: any) => id !== catId);
        }
    }

    isCategorySelected(catId: any): boolean {
        return this.newSubcategory.category_ids && this.newSubcategory.category_ids.includes(catId);
    }

    toggleForm(subcategory?: any) {
        this.showForm = !this.showForm;
        this.imagePreviewUrl = null;
        this.isNewImageSelected = false;

        if (subcategory) {
            this.selectedSubcategory = { ...subcategory };
            this.newSubcategory = {
                ...subcategory,
                image: null,
                category_ids: subcategory.categories ? subcategory.categories.map((c: any) => c.id) : []
            };
            this.imagePreviewUrl = subcategory.display_url || subcategory.image;
        } else {
            this.selectedSubcategory = null;
            this.newSubcategory = {
                name: '',
                category_ids: [],
                status: 'active',
                image: null,
                image_url: ''
            };
        }
    }

    onImageError(event: any) {
        event.target.src = this.defaultSubcategoryImage;
    }

    onImageChange(e: any) {
        const file = e.target.files[0];
        if (file) {
            this.newSubcategory.image = file;
            this.isNewImageSelected = true;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreviewUrl = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    getImageSrc(imageUrl: string | null): string {
        if (!imageUrl) return this.defaultSubcategoryImage;
        if (imageUrl.startsWith('data:')) return imageUrl;
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/menu-subcategories/image')) return this.apiBaseUrl + imageUrl;

        return this.apiBaseUrl + imageUrl;
    }

    saveSubcategory() {
        if (this.newSubcategory.category_ids.length === 0) {
            this.toastr.warning("Please select at least one parent category");
            return;
        }

        const fd = new FormData();
        fd.append('name', this.newSubcategory.name);
        // Stringify array for FormData
        fd.append('category_ids', JSON.stringify(this.newSubcategory.category_ids));
        fd.append('status', this.newSubcategory.status);

        if (this.newSubcategory.image instanceof File) {
            fd.append('image', this.newSubcategory.image);
        }

        if (this.selectedSubcategory) {
            if (!this.isNewImageSelected) {
                fd.append('existingImage', this.selectedSubcategory.image || this.selectedSubcategory.image_url);
            }

            this.apiService.updateMenuSubcategory(this.selectedSubcategory.id, fd).subscribe({
                next: (res: any) => {
                    this.toastr.success(res.message || "Subcategory updated!");
                    this.showForm = false;
                    this.loadSubcategories();
                },
                error: (err) => this.toastr.error(err.message || "Update failed")
            });
        } else {
            this.apiService.createMenuSubcategory(fd).subscribe({
                next: (res: any) => {
                    this.toastr.success(res.message || "Subcategory created!");
                    this.showForm = false;
                    this.loadSubcategories();
                },
                error: (err) => this.toastr.error(err.message || "Creation failed")
            });
        }
    }

    deleteSubcategory(id: number) {
        this.subcategoryIdToDelete = id;
        this.showDeleteConfirm = true;
    }

    confirmDelete() {
        if (this.subcategoryIdToDelete) {
            this.apiService.deleteMenuSubcategory(this.subcategoryIdToDelete).subscribe({
                next: () => {
                    this.toastr.success("Subcategory deleted");
                    this.loadSubcategories();
                    this.cancelDelete();
                },
                error: () => this.toastr.error("Delete failed")
            });
        }
    }

    cancelDelete() {
        this.showDeleteConfirm = false;
        this.subcategoryIdToDelete = null;
    }
}
