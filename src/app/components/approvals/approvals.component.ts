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

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.fetchUsers('pending');
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
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(u =>
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
}
