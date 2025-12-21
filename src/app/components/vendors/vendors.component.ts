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

  newVendor: any = {
    name: '',
    phone: '',
    email: '',
    experience: '',
    address: '',
    businessname: '',
    describe: ''
  };

  constructor(private api: ApiService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors() {
    this.api.getVendors().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.allVendors = res.data || [];
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
        v.name.toLowerCase().includes(q) ||
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
    if (vendor) {
      this.newVendor = { ...vendor };
    } else {
      this.newVendor = {
        name: '',
        phone: '',
        email: '',
        experience: '',
        address: '',
        businessname: '',
        describe: ''
      };
    }
    this.showForm = !this.showForm;
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
    // Current API implementation doesn't have create/update for vendors
    this.toastr.info("Vendor management is evolving. Full saving capability coming soon.");
    this.toggleForm();
  }
}