import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-service-items',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './service-items.component.html',
  styleUrls: ['./service-items.component.scss'],
})
export class ServiceItemsComponent {

  serviceItems: any[] = [];
  services: any[] = [];
  imagePreview: any = null;
  showForm = false;
  selectedItem: any = null;
  searchText = '';

  formData: any = {
    service_id: '',
    name: '',
    description: '',
    quantity_type: '',
    price: '',
    image: null
  };

  defaultImage = "https://img.icons8.com/fluency/512/services.png";

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadServices();
    this.loadServiceItems();
  }

  // LOAD SERVICES FOR DROPDOWN
  loadServices() {
    this.api.getServices().subscribe((res: any) => {
      this.services = res.data || [];
    });
  }

  // LOAD SERVICE ITEMS LIST
  loadServiceItems() {
    this.api.getServiceItems().subscribe((res: any) => {
      this.serviceItems = res.data?.map((item: any) => ({
        ...item,
        image: item.image_url
      })) || [];
    });
  }

  toggleForm(item?: any) {
    this.showForm = !this.showForm;

    if (item) {
      this.selectedItem = item;
      this.formData = {
        service_id: item.service_id,
        name: item.name,
        description: item.description || '',
        quantity_type: item.quantity_type || '',
        price: item.price || '',
        image: null,
      };

      this.imagePreview = item.image;
    } else {
      this.selectedItem = null;
      this.formData = {
        service_id: '',
        name: '',
        description: '',
        quantity_type: '',
        price: '',
        image: null
      };
      this.imagePreview = null;
    }
  }

  onImageChange(e: any) {
    const file = e.target.files[0];
    this.formData.image = file;

    if (file) {
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  onImageError(e: any) {
    e.target.src = this.defaultImage;
  }

  // SAVE SERVICE ITEM (CREATE / UPDATE)
  saveServiceItem() {
    const fd = new FormData();

    fd.append('service_id', this.formData.service_id);
    fd.append('name', this.formData.name);
    fd.append('description', this.formData.description);
    fd.append('quantity_type', this.formData.quantity_type);
    fd.append('price', this.formData.price);

    if (this.formData.image instanceof File) {
      fd.append('image', this.formData.image);
    }

    // EDIT MODE
    if (this.selectedItem) {
      if (this.selectedItem.image) {
        fd.append('existingImage', this.selectedItem.image);
      }

      this.api.updateServiceItem(this.selectedItem.service_item_id, fd).subscribe(res => {
        alert(res.message);
        this.showForm = false;
        this.loadServiceItems();
      });

    } else {
      // CREATE
      this.api.createServiceItem(fd).subscribe(res => {
        alert(res.message);
        this.showForm = false;
        this.loadServiceItems();
      });
    }
  }

  // DELETE SERVICE ITEM
  deleteServiceItem(id: number) {
    if (confirm("Delete this service item?")) {
      this.api.deleteServiceItem(id).subscribe(() => {
        this.loadServiceItems();
      });
    }
  }
}
