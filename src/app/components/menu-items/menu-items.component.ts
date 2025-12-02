import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.scss',
})
export class MenuItemsComponent {

  menuitems: any[] = [];
  imagePreview: any = null;
  showForm = false;
  selectedMenuItem: any = null;

  newMenuItem: any = {
    name: '',
    description: '',
    price: '',
    type: '',
    image: null
  };

  defaultItemImage = "https://img.icons8.com/fluency/512/restaurant.png";   // default fallback image

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadMenuItems();
  }

  // LOAD MENU ITEMS
  loadMenuItems() {
    this.apiService.getMenuItems().subscribe({
      next: (res: any) => {
        this.menuitems = Array.isArray(res?.data) ? res.data.map((item: any) => ({
          ...item,
          image: item.image_url || item.image // Map image_url to image
        })) : [];
      },
      error: (err) => {
        console.error("Error loading menu items:", err);
        this.menuitems = [];
      }
    });
  }

  onImageChange(e: any) {
    const file = e.target.files[0];
    this.newMenuItem.image = file;

    if (file) {
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  toggleForm(item?: any) {
    this.showForm = !this.showForm;

    if (item) {
      console.log('toggleForm - EDIT MODE - item:', item);
      this.selectedMenuItem = { ...item };
      this.newMenuItem = {
        ...item,
        description: item.description || '',
        price: item.price || ''
      };

      // Map veg/nonveg to type for the dropdown
      if (item.veg === 1 || item.veg === '1') {
        this.newMenuItem.type = 'Veg';
      } else if (item.nonveg === 1 || item.nonveg === '1') {
        this.newMenuItem.type = 'Non-Veg';
      }

      this.imagePreview = item.image;        // existing image preview
      console.log('selectedMenuItem after setting:', this.selectedMenuItem);
      console.log('newMenuItem after setting:', this.newMenuItem);
    } else {
      console.log('toggleForm - CREATE MODE');
      this.selectedMenuItem = null;
      this.newMenuItem = { name: '', description: '', price: '', type: '', image: null };
      this.imagePreview = null;
    }
  }

  // IMAGE FALLBACK ERROR
  onImageError(event: any) {
    event.target.src = this.defaultItemImage;
  }



  // SAVE MENU ITEM (CREATE OR UPDATE)
  saveMenuItem() {
    console.log('selectedMenuItem:', this.selectedMenuItem);
    console.log('selectedMenuItem.id:', this.selectedMenuItem?.menu_item_id);

    const fd = new FormData();
    fd.append('name', this.newMenuItem.name);
    fd.append('description', this.newMenuItem.description || '');
    fd.append('price', this.newMenuItem.price);

    // Map type back to veg/nonveg
    fd.append('veg', this.newMenuItem.type === 'Veg' ? '1' : '0');
    fd.append('nonveg', this.newMenuItem.type === 'Non-Veg' ? '1' : '0');

    if (this.newMenuItem.image instanceof File) {
      fd.append('image', this.newMenuItem.image);
    }

    // Check if we're editing (selectedMenuItem exists and has an id)
    const isEditing = this.selectedMenuItem && this.selectedMenuItem.menu_item_id !== undefined && this.selectedMenuItem.menu_item_id !== null;

    if (isEditing) {
      console.log('UPDATE MODE - ID:', this.selectedMenuItem.menu_item_id);
      // editing → send old image path only if it exists
      if (this.selectedMenuItem.image) {
        fd.append('existingImage', this.selectedMenuItem.image);
      }

      this.apiService.updateMenuItem(this.selectedMenuItem.menu_item_id, fd).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.showForm = false;
          this.loadMenuItems();
        },
        error: (err) => {
          alert("Update failed: " + err.message);
        }
      });

    } else {
      console.log('CREATE MODE');
      // creating new
      this.apiService.createMenuItem(fd).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.showForm = false;
          this.loadMenuItems();
        },
        error: (err) => {
          alert("Create failed: " + err.message);
        }
      });
    }
  }

  // DELETE
  deleteMenuItem(menu_item_id: number) {
    if (confirm("Delete this menu item?")) {
      this.apiService.deleteMenuItem(menu_item_id).subscribe({
        next: () => this.loadMenuItems(),
        error: (err) => alert("Delete failed: " + err.message)
      });
    }
  }
}
