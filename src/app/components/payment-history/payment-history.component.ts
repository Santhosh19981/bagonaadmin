import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, SidemenuComponent],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'] // fixed typo
})
export class PaymentHistoryComponent implements OnInit {
  transactions: any[] = [];
  activeTab: string = 'All';

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

  get filteredTransactions() {
    if (this.activeTab === 'All') {
      return this.transactions;
    }
    return this.transactions.filter(tx => tx.type === this.activeTab);
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
