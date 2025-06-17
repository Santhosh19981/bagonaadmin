import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendors',
  imports: [CommonModule, SidemenuComponent, FormsModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  showForm: boolean = false;  // Show the list first
  selectedVendor: any = null;

  vendors: any[] = [
    {
      id: 1,
      name: 'Ravi Kumar',
      phone: '9876543210',
      email: 'ravi@example.com',
      experience: '5 years',
      address: 'Delhi',
      services: 'Service 1'
    },
    {
      id: 2,
      name: 'Anita Sharma',
      phone: '8765432109',
      email: 'anita@example.com',
      experience: '3 years',
      address: 'Mumbai',
      services: 'Service 2'
    },
    {
      id: 3,
      name: 'Joseph Mathew',
      phone: '9123456789',
      email: 'joseph@example.com',
      experience: '8 years',
      address: 'Bangalore',
      services: 'Service 1'
    }
  ];

  newVendor: any = {
    name: '',
    phone: '',
    email: '',
    experience: '',
    address: '',
    services: ''
  };

  toggleForm(vendor?: any) {
    this.selectedVendor = vendor || null;
    this.newVendor = vendor ? { ...vendor } : {
      name: '',
      phone: '',
      email: '',
      experience: '',
      address: '',
      services: ''
    };
    this.showForm = !this.showForm;
  }

  saveVendor() {
    if (this.selectedVendor) {
      const index = this.vendors.findIndex(v => v.id === this.selectedVendor.id);
      if (index !== -1) {
        this.vendors[index] = { ...this.vendors[index], ...this.newVendor };
      }
    } else {
      this.vendors.push({ ...this.newVendor, id: Date.now() });
    }

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

  deleteVendor(vendorId: number) {
    this.vendors = this.vendors.filter(v => v.id !== vendorId);
  }
}
