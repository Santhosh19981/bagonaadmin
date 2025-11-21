import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {

  services: any[] = [];
  showForm = false;
  selectedService: any = null;

  newService: any = {
    name: '',
    description: '',
    status: 'inactive',
    unit_id: '',
    image: null
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadServices();
  }

  // ---------------------- LOAD SERVICES ----------------------
  loadServices() {
    this.apiService.getServices().subscribe({
      next: (res: any) => {
        this.services = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        console.error("❌ Error loading services:", err);
        this.services = [];
      }
    });
  }

  // ---------------------- TOGGLE FORM ----------------------
  toggleForm(service?: any) {
    this.showForm = !this.showForm;

    if (service) {
      this.selectedService = { ...service };
      this.newService = { 
        ...service,
        image: null
      };
    } else {
      this.selectedService = null;
      this.newService = {
        name: '',
        description: '',
        status: 'inactive',
        unit_id: '',
        image: null
      };
    }
  }

  // ---------------------- IMAGE UPLOAD ----------------------
  onImageChange(e: any) {
    this.newService.image = e.target.files[0];
  }

  // ---------------------- SAVE (CREATE / UPDATE) ----------------------
  saveService() {
    const fd = new FormData();

    fd.append('name', this.newService.name);
    fd.append('description', this.newService.description);
    fd.append('status', this.newService.status);
    fd.append('unit_id', this.newService.unit_id);

    if (this.newService.image instanceof File) {
      fd.append('image', this.newService.image);
    }

    if (this.selectedService) {
      fd.append('existingImage', this.selectedService.image_data);

      this.apiService.updateService(this.selectedService.service_id, fd).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.showForm = false;
          this.loadServices();
        },
        error: (err) => {
          alert("Update failed: " + err.message);
        }
      });

    } else {
      this.apiService.createService(fd).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.showForm = false;
          this.loadServices();
        },
        error: (err) => {
          alert("Create failed: " + err.message);
        }
      });
    }
  }

  // ---------------------- DELETE ----------------------
  deleteService(id: number) {
    if (confirm("Delete this service?")) {
      this.apiService.deleteService(id).subscribe({
        next: () => this.loadServices()
      });
    }
  }

  // ---------------------- TOGGLE ACTIVE/INACTIVE ----------------------
  onToggleChange(event: any) {
    const isChecked = event.target.checked;
    this.newService.status = isChecked ? 'active' : 'inactive';
  }
}
