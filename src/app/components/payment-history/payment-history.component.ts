import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

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

  ngOnInit() {
    const storedData = localStorage.getItem('paymentTransactions');
    if (storedData) {
      this.transactions = JSON.parse(storedData);
    } else {
      this.transactions = [
        { id: 1, date: '2025-05-15', type: 'Credit', amount: 1200, location: 'Hyderabad' },
        { id: 2, date: '2025-05-16', type: 'Debit', amount: 800, location: 'Mumbai' },
        { id: 3, date: '2025-05-17', type: 'Credit', amount: 500, location: 'Delhi' },
        { id: 4, date: '2025-05-18', type: 'Debit', amount: 300, location: 'Bangalore' }
      ];
      this.saveTransactions();
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

  addTransaction(transaction: any) {
    this.transactions.push(transaction);
    this.saveTransactions();
  }

  deleteTransaction(id: number) {
    this.transactions = this.transactions.filter(tx => tx.id !== id);
    this.saveTransactions();
  }

  saveTransactions() {
    localStorage.setItem('paymentTransactions', JSON.stringify(this.transactions));
  }
}
