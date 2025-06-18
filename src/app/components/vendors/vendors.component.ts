import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent implements OnInit {
  showForm: boolean = false;
  selectedVendor: any = null;

  vendors: any[] = [];

  servicesList: string[] = [
    'Function Halls',
    'Kirana',
    'Vegetables',
    'Poultry',
    'Tent House',
    'Dairy Products',
    'Photography',
    'Catering',
    'Decoration',
    'Water Supply'
  ];

  newVendor: any = {
    name: '',
    phone: '',
    email: '',
    experience: '',
    address: '',
    services: ''
  };

ngOnInit(): void {
  const data = localStorage.getItem('vendors');
  this.vendors = data ? JSON.parse(data) : [];

  
  this.showForm = this.vendors.length === 0;
}

  toggleForm(vendor?: any): void {
    this.selectedVendor = vendor || null;
    this.newVendor = vendor
      ? { ...vendor }
      : {
          name: '',
          phone: '',
          email: '',
          experience: '',
          address: '',
          services: ''
        };
    this.showForm = true;
  }

  saveVendor(): void {
    if (this.selectedVendor) {
      const index = this.vendors.findIndex(v => v.id === this.selectedVendor.id);
      if (index !== -1) {
        this.vendors[index] = { ...this.newVendor, id: this.selectedVendor.id };
      }
    } else {
      this.vendors.push({ ...this.newVendor, id: Date.now() });
    }

    this.saveToStorage();
    this.resetForm();
  }

  deleteVendor(id: number): void {
    this.vendors = this.vendors.filter(v => v.id !== id);
    this.saveToStorage();
    this.showForm = this.vendors.length === 0;
  }

  saveToStorage(): void {
    localStorage.setItem('vendors', JSON.stringify(this.vendors));
  }

  resetForm(): void {
    this.showForm = false;
    this.selectedVendor = null;
    this.newVendor = {
      name: '',
      phone: '',
      email: '',
      experience: '',
      address: '',
      services: ''
    };
  }
}
