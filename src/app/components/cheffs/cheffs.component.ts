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

  newCheff = this.initCheff();

  constructor(private api: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadCheffs();
  }

  loadCheffs() {
    this.api.getChefs().subscribe({
      next: (res: any) => {
        if (res.status) {
          // Filter to only include chefs with isapproved > 0 as per user requirement
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
    this.newCheff = cheff ? { ...cheff } : this.initCheff();
    this.showForm = !this.showForm;
  }

  saveCheff() {
    // Current API doesn't seem to have a create/update for chefs in api.service.ts 
    // but we'll implement the logic for when it's ready or just show a success message for UI completeness
    this.toastr.info("Chef details processing functionality coming soon.");
    this.toggleForm();
  }

  updateStatus(id: number, status: number) {
    this.api.updateActiveStatus(id, status).subscribe({
      next: () => {
        this.toastr.success(`Chef status updated to ${status === 1 ? 'Active' : 'Inactive'} successfully`);
        this.loadCheffs();
      },
      error: () => {
        this.toastr.error("Failed to update status");
      }
    });
  }

  private initCheff() {
    return { name: '', mobile: '', email: '', experience: '', address: '', cookingstyle: '', describe: '' };
  }
}