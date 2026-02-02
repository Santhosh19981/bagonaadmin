import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cheffs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './cheffs.component.html',
  styleUrl: './cheffs.component.scss'
})
export class CheffsComponent implements OnInit {

  allCheffs: any[] = [];
  filteredCheffs: any[] = [];
  paginatedCheffs: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedCheff: any = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  showPassword = false;

  newCheff = this.initCheff();

  constructor(private api: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadCheffs();
  }

  loadCheffs() {
    this.api.getChefs().subscribe({
      next: (res: any) => {
        if (res.status) {
          // Display only approved chefs
          this.allCheffs = (res.data || []).filter((chef: any) => chef.isapproved > 0);
          this.applyFilter('');
        }
      },
      error: (err) => {
        this.toastr.error("Failed to load chefs");
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
      this.filteredCheffs = [...this.allCheffs];
    } else {
      this.filteredCheffs = this.allCheffs.filter(chef =>
        chef.name.toLowerCase().includes(q) ||
        (chef.email && chef.email.toLowerCase().includes(q)) ||
        (chef.mobile && chef.mobile.includes(q))
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredCheffs.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.updatePaginatedItems();
  }

  updatePaginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCheffs = this.filteredCheffs.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedItems();
    }
  }

  toggleForm(cheff: any = null) {
    this.selectedCheff = cheff;
    this.showPassword = false;
    if (cheff) {
      this.newCheff = {
        fullName: cheff.name,
        email: cheff.email,
        mobile: cheff.mobile,
        password: '',
        age: cheff.age,
        experience: cheff.experience,
        address: cheff.address,
        declaration: cheff.describe,
        rating: cheff.rating || 0,
        role: 2
      };
      this.imagePreview = cheff.image || null;
    } else {
      this.newCheff = this.initCheff();
      this.imagePreview = null;
    }
    this.selectedFile = null;
    this.showForm = !this.showForm;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

  saveCheff() {
    if (!this.newCheff.fullName || !this.newCheff.email || !this.newCheff.mobile || (!this.selectedCheff && !this.newCheff.password)) {
      this.toastr.warning("Please fill required fields");
      return;
    }

    // Mobile Validation: 10 digits, numbers only
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(this.newCheff.mobile)) {
      this.toastr.error("Mobile number must be exactly 10 digits");
      return;
    }

    const formData = new FormData();
    Object.entries(this.newCheff).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.selectedCheff) {
      this.api.updateChefProfile(this.selectedCheff.id, formData).subscribe({
        next: (res: any) => {
          this.toastr.success("Chef updated successfully");
          this.loadCheffs();
          this.toggleForm();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || "Failed to update chef");
        }
      });
    } else {
      this.api.registerChef(formData).subscribe({
        next: (res: any) => {
          this.toastr.success("Chef registered successfully");
          this.loadCheffs();
          this.toggleForm();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || "Failed to register chef");
        }
      });
    }
  }

  deleteCheff(id: number) {
    if (confirm("Are you sure you want to delete this chef?")) {
      this.api.deleteChef(id).subscribe({
        next: () => {
          this.toastr.success("Chef deleted successfully");
          this.loadCheffs();
        },
        error: () => {
          this.toastr.error("Failed to delete chef");
        }
      });
    }
  }

  updateStatus(id: number, status: number) {
    this.api.updateActiveStatus(id, status).subscribe({
      next: () => {
        this.toastr.success(`Chef status updated to ${status === 1 ? 'Run' : 'Stop'} successfully`);
        this.loadCheffs();
      },
      error: () => {
        this.toastr.error("Failed to update status");
      }
    });
  }

  private initCheff() {
    return {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      age: '',
      experience: '',
      address: '',
      declaration: '',
      rating: 0,
      role: 2
    };
  }
}
