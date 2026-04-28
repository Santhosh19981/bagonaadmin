import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, SidemenuComponent, HeaderComponent],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent implements OnInit {
  transactions: any[] = [];
  activeTab: string = 'All';
  searchQuery: string = '';
  loading: boolean = false;
  error: string | null = null;
  userRole: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchPaymentHistory();
  }

  fetchPaymentHistory() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.error = "User not logged in";
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;
      this.userRole = user.role;
      const role = user.role;

      this.loading = true;
      
      // Role-based filtering:
      // If Admin (role 4), pass null to fetch all history.
      // Otherwise (Vendor/Chef), pass userId to fetch only their own history.
      const fetchId = role === 4 ? undefined : userId;

      this.apiService.getPaymentHistory(fetchId).subscribe({
        next: (res) => {
          if (res.status && res.data) {
            this.transactions = res.data.map((tx: any) => ({
              ...tx,
              // Backend returns 'credit'/'debit' (lowercase enum), component expects 'Credit'/'Debit'
              type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase(),
              // Backend uses 'description' as location/details
              location: tx.description || 'N/A'
            }));
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching payment history', err);
          this.error = "Failed to load payment history";
          this.loading = false;
        }
      });
    } catch (e) {
      console.error('Error parsing user data', e);
      this.error = "Invalid user data";
    }
  }

  onSearch(query: string) {
    this.searchQuery = query.toLowerCase();
  }

  get filteredTransactions() {
    let filtered = this.transactions;

    // Tab filter
    if (this.activeTab !== 'All') {
      filtered = filtered.filter(tx => tx.type === this.activeTab);
    }

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(tx =>
        tx.location.toLowerCase().includes(this.searchQuery) ||
        tx.date.includes(this.searchQuery) ||
        tx.amount.toString().includes(this.searchQuery)
      );
    }

    return filtered;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
