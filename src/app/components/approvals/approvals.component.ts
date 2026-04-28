import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, SidemenuComponent, HeaderComponent],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent implements OnInit {
  activeTab: string = 'pending';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Detail Modal
  selectedUser: any | null = null;
  showDetailModal: boolean = false;

  // Filters
  selectedBusinessType: string = 'all';
  selectedServiceFilter: string = 'all';
  currentSearchQuery: string = '';
  servicesList: any[] = [];

  constructor(public api: ApiService) { }

  ngOnInit() {
    this.fetchUsers('pending');
    this.api.getServices().subscribe((res: any) => {
      if (res.status === 'success' || res.status === true) {
        this.servicesList = res.data;
      }
    });
  }

  fetchUsers(type: string) {
    this.activeTab = type;
    this.currentPage = 1;

    let apiCall;
    switch (type) {
      case 'pending': apiCall = this.api.getPendingUsers(); break;
      case 'approved': apiCall = this.api.getApprovedUsers(); break;
      case 'rejected': apiCall = this.api.getRejectedUsers(); break;
      case 'all': apiCall = this.api.getAllUsers(); break;
      default: apiCall = this.api.getPendingUsers();
    }

    apiCall.subscribe((res: any) => {
      if (res.status) {
        this.allUsers = res.data;
        this.applyFilter(this.currentSearchQuery);
      }
    });
  }

  onSearch(query: string) {
    this.currentSearchQuery = query;
    this.applyFilter(query);
  }

  onBusinessTypeChange(event: any) {
    this.selectedBusinessType = event.target.value;
    if (this.selectedBusinessType !== 'vendor') {
      this.selectedServiceFilter = 'all';
    }
    this.applyFilter(this.currentSearchQuery);
  }

  onServiceChange(event: any) {
    this.selectedServiceFilter = event.target.value;
    this.applyFilter(this.currentSearchQuery);
  }

  applyFilter(query: string) {
    const q = query.toLowerCase().trim();
    let filtered = this.allUsers;

    if (this.selectedBusinessType !== 'all') {
      const targetRole = this.selectedBusinessType === 'chef' ? 2 : 3;
      filtered = filtered.filter(u => Number(u.role) === targetRole);

      if (this.selectedBusinessType === 'vendor' && this.selectedServiceFilter !== 'all') {
        filtered = filtered.filter(u => {
          if (!u.services) return false;
          const userServices = String(u.services).split(',').map(s => s.trim());
          return userServices.includes(String(this.selectedServiceFilter));
        });
      }
    }

    if (!q) {
      this.filteredUsers = [...filtered];
    } else {
      this.filteredUsers = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        (u.businessname && u.businessname.toLowerCase().includes(q)) ||
        u.mobile.includes(q)
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();
    }
  }

  openDetails(user: any) {
    this.selectedUser = user;
    this.showDetailModal = true;
  }

  closeDetails() {
    this.showDetailModal = false;
    this.selectedUser = null;
  }

  approve(id: any) {
    this.api.approveUser(id).subscribe(() => {
      this.fetchUsers(this.activeTab);
      this.closeDetails();
    });
  }

  reject(id: any) {
    this.api.rejectUser(id).subscribe(() => {
      this.fetchUsers(this.activeTab);
      this.closeDetails();
    });
  }

  getServiceNames(serviceIdsString: string): string {
    if (!serviceIdsString || !this.servicesList.length) return serviceIdsString;
    const ids = String(serviceIdsString).split(',').map(id => id.trim());
    const names = ids.map(id => {
       const service = this.servicesList.find(s => String(s.service_id) === id);
       return service ? service.name : id;
    });
    return names.join(', ');
  }
}
