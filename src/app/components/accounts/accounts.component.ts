import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit {
  vendors: any[] = [];
  selectedVendor: any = null;
  accounts: any[] = [];
  isLoading: boolean = false;
  isAccountModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingAccountId: number | null = null;
  isPayoutModalOpen: boolean = false;
  currentUserRole: number | null = null;
  currentUser: any = null;

  // Form Model
  accountForm: any = {
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    is_default: false
  };

  pendingPayouts: any[] = [];

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.currentUserRole = Number(this.currentUser.role);
    }

    if (this.currentUserRole === 4) {
      this.loadVendors();
      this.loadPendingPayouts();
    } else {
      // For Vendors/Chefs, automatically select themselves
      this.selectedVendor = this.currentUser;
      this.loadVendorAccounts(this.currentUser.id);
    }
  }


  loadVendors(): void {
    this.isLoading = true;
    // Combine chefs and vendors for recruitment/account purposes
    this.apiService.getChefs().subscribe({
      next: (chefsRes) => {
        const chefs = (chefsRes.data || []).map((c: any) => ({ ...c, displayRole: 'Chef' }));
        this.apiService.getVendors().subscribe({
          next: (vendorsRes) => {
            const vendors = (vendorsRes.data || []).map((v: any) => ({ ...v, displayRole: 'Vendor' }));
            this.vendors = [...chefs, ...vendors];
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading vendors:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading chefs:', err);
        this.isLoading = false;
      }
    });
  }

  loadPendingPayouts(): void {
    this.apiService.getPendingPayouts().subscribe({
      next: (res) => {
        this.pendingPayouts = res.data || [];
      },
      error: (err) => console.error('Error loading pending payouts:', err)
    });
  }

  selectVendor(vendor: any): void {
    this.selectedVendor = vendor;
    this.loadVendorAccounts(vendor.user_id || vendor.id);
  }

  loadVendorAccounts(vendorId: number): void {
    this.apiService.getVendorAccounts(vendorId).subscribe({
      next: (res) => {
        this.accounts = res.data || [];
      },
      error: (err) => console.error('Error loading vendor accounts:', err)
    });
  }

  openAccountModal(): void {
    this.isEditMode = false;
    this.editingAccountId = null;
    this.accountForm = {
      bank_name: '',
      account_holder_name: '',
      account_number: '',
      ifsc_code: '',
      is_default: false
    };
    this.isAccountModalOpen = true;
  }

  openEditModal(account: any): void {
    this.isEditMode = true;
    this.editingAccountId = account.account_id;
    this.accountForm = {
      bank_name: account.bank_name,
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      ifsc_code: account.ifsc_code,
      is_default: account.is_default
    };
    this.isAccountModalOpen = true;
  }

  saveAccount(): void {
    if (!this.selectedVendor) return;

    // Normalize vendor ID (Admin list uses user_id, LocalStorage uses id)
    const vendorId = this.selectedVendor.user_id || this.selectedVendor.id;

    if (!vendorId) {
      this.toastr.error('Vendor ID not found');
      return;
    }

    const payload = {
      ...this.accountForm,
      vendor_user_id: vendorId
    };

    if (this.isEditMode && this.editingAccountId) {
      this.apiService.updateVendorAccount(this.editingAccountId, payload).subscribe({
        next: (res) => {
          this.toastr.success('Account updated successfully');
          this.isAccountModalOpen = false;
          this.loadVendorAccounts(vendorId);
        },
        error: (err) => this.toastr.error('Failed to update account')
      });
    } else {
      this.apiService.addVendorAccount(payload).subscribe({
        next: (res) => {
          this.toastr.success('Account added successfully');
          this.isAccountModalOpen = false;
          this.loadVendorAccounts(vendorId);
        },
        error: (err) => this.toastr.error('Failed to add account')
      });
    }
  }



  setDefault(account: any): void {
    const vendorId = this.selectedVendor.user_id || this.selectedVendor.id;
    this.apiService.setDefaultAccount(account.account_id, vendorId).subscribe({
      next: (res) => {
        this.toastr.success('Default account updated');
        this.loadVendorAccounts(vendorId);
      },
      error: (err) => this.toastr.error('Update failed')
    });
  }


  deleteAccount(account: any): void {
    const vendorId = this.selectedVendor.user_id || this.selectedVendor.id;
    if (confirm('Are you sure you want to delete this account?')) {
      this.apiService.deleteVendorAccount(account.account_id).subscribe({
        next: (res) => {
          this.toastr.success('Account deleted');
          this.loadVendorAccounts(vendorId);
        },
        error: (err) => this.toastr.error('Delete failed')
      });
    }
  }


  confirmPayout(payout: any): void {
    if (confirm(`Confirm payout of ₹${payout.vendor_payout_amount} to ${payout.vendor_name}?`)) {
      this.apiService.confirmPayout(payout.order_id, {}).subscribe({
        next: (res) => {
          this.toastr.success('Payout marked as completed');
          this.loadPendingPayouts();
        },
        error: (err) => this.toastr.error('Payout failed')
      });
    }
  }
}
