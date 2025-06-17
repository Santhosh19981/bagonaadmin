import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";

@Component({
  selector: 'app-payment-history',
  imports: [CommonModule, SidemenuComponent],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent {
transactions = [
  { id: 1, date: '2025-05-15', type: 'Credit', amount: 1200, location: 'Hyderabad' },
  { id: 2, date: '2025-05-16', type: 'Debit', amount: 800, location: 'Mumbai' },
  { id: 3, date: '2025-05-17', type: 'Credit', amount: 500, location: 'Delhi' },
  { id: 4, date: '2025-05-18', type: 'Debit', amount: 300, location: 'Bangalore' }
];
activeTab: string = 'All';

get filteredTransactions() {
  if (this.activeTab === 'All') return this.transactions;
  return this.transactions.filter(tx => tx.type === this.activeTab);
}

setTab(tab: string) {
  this.activeTab = tab;
}
}
