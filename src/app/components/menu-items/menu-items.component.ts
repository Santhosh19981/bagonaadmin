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
    type: '',
    image: null
  };

  defaultItemImage = "https://img.icons8.com/?size=512&id=59815&format=png";   // default fallback image

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMenuItems();
  }

  // LOAD MENU ITEMS
  loadMenuItems() {
    this.apiService.getMenuItems().subscribe({
      next: (res: any) => {
        this.menuitems = Array.isArray(res?.data) ? res.data : [];
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
    this.selectedMenuItem = { ...item };
    this.newMenuItem = { ...item };
    this.imagePreview = item.image;        // existing image preview
  } else {
    this.selectedMenuItem = null;
    this.newMenuItem = { name: '', type: '', image: null };
    this.imagePreview = null;
  }
}

  // IMAGE FALLBACK ERROR
  onImageError(event: any) {
    event.target.src = this.defaultItemImage;
  }



  // SAVE MENU ITEM (CREATE OR UPDATE)
  saveMenuItem() {
    const fd = new FormData();
    fd.append('name', this.newMenuItem.name);
    fd.append('type', this.newMenuItem.type);

    if (this.newMenuItem.image instanceof File) {
      fd.append('image', this.newMenuItem.image);
    }

    if (this.selectedMenuItem) {
      // editing → send old image path
      fd.append('existingImage', this.selectedMenuItem.image);

      this.apiService.updateMenuItem(this.selectedMenuItem.id, fd).subscribe({
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
  deleteMenuItem(id: number) {
    if (confirm("Delete this menu item?")) {
      this.apiService.deleteMenuItem(id).subscribe({
        next: () => this.loadMenuItems(),
        error: (err) => alert("Delete failed: " + err.message)
      });
    }
  }
}
