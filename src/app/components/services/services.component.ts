import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';

interface Service {
  id?: number;
  servicename: string;
  description: string;
  Active: 'Active' | 'Inactive';
  image: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {
  services: Service[] = [
    { id: 1, servicename: 'FunctionHalls', description: '', Active: 'Active', image: '' },
    { id: 2, servicename: 'Bhagona', description: '', Active: 'Inactive', image: '' },
    { id: 3, servicename: 'Tents', description: '', Active: 'Active', image: '' }
  ];

  showForm = false;
  selectedService: Service | null = null;
  newService: Service = this.initService();

  // Toggle form open/close, and set selected service if editing
  toggleForm(service: Service | null = null) {
    this.selectedService = service;
    this.newService = service ? { ...service } : this.initService();
    this.showForm = !this.showForm;
  }

  // Save new or edited service
  saveService() {
    if (this.selectedService) {
      const index = this.services.findIndex(e => e.id === this.selectedService!.id);
      this.services[index] = { ...this.newService, id: this.selectedService!.id };
    } else {
      this.services.push({ ...this.newService, id: Date.now() });
    }
    this.toggleForm();
  }

  // Delete service by ID
  deleteService(id: number) {
    this.services = this.services.filter(e => e.id !== id);
    this.showForm = this.services.length === 0;
  }

  // Handle image file input change
  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newService.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle toggle switch change for Active/Inactive status
  onToggleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.newService.Active = input.checked ? 'Active' : 'Inactive';
  }

  // Toggle Active status directly on a service item (e.g., from list)
  toggleActive(service: Service) {
    service.Active = service.Active === 'Active' ? 'Inactive' : 'Active';
  }

  // Initialize a new empty service
  private initService(): Service {
    return {
      servicename: '',
      description: '',
      Active: 'Inactive',
      image: ''
    };
  }
}
