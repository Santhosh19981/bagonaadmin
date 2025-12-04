import { Component } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, SidemenuComponent],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent {
  activeTab: string = 'pending';  
  users: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchUsers('pending');
  }

  fetchUsers(type: string) {
    this.activeTab = type;

    let apiCall;

    switch (type) {
      case 'pending':
        apiCall = this.api.getPendingUsers();
        break;
      case 'approved':
        apiCall = this.api.getApprovedUsers();
        break;
      case 'rejected':
        apiCall = this.api.getRejectedUsers();
        break;
      case 'all':
        apiCall = this.api.getAllUsers();
        break;
      default:
        apiCall = this.api.getPendingUsers();
    }

    apiCall.subscribe((res: any) => {
      if (res.status) {
        this.users = res.data;
      }
    });
  }

  approve(id: any) {
    this.api.approveUser(id).subscribe(() => {
      this.fetchUsers(this.activeTab);
    });
  }

  reject(id: any) {
    this.api.rejectUser(id).subscribe(() => {
      this.fetchUsers(this.activeTab);
    });
  }
}
