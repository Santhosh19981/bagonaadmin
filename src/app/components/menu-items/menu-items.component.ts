import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';

interface MenuItem {
  id?: number;
  name: string;
  type: 'Veg' | 'Non-Veg';
  image: string;
}

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.scss',
})
export class MenuItemsComponent {
  menuitems: MenuItem[] = [
    { id: 1, name: 'Paneer Butter Masala', type: 'Veg', image: '' },
    { id: 2, name: 'Chicken Biryani', type: 'Non-Veg', image: '' },
    { id: 3, name: 'Veg Pulao', type: 'Veg', image: '' },
  ];

  showForm = false;
  selectedMenuItem: MenuItem | null = null;
  newMenuItem: MenuItem = this.initMenuItem();

  // Toggle form open/close, and set selected item if editing
  toggleForm(item: MenuItem | null = null) {
    this.selectedMenuItem = item;
    this.newMenuItem = item ? { ...item } : this.initMenuItem();
    this.showForm = !this.showForm;
  }

  // Save new or edited item
  saveMenuItem() {
    if (!this.newMenuItem.name || !this.newMenuItem.type || !this.newMenuItem.image) {
      alert('Please fill all fields including image, name, and type.');
      return;
    }

    if (this.selectedMenuItem) {
      const index = this.menuitems.findIndex(e => e.id === this.selectedMenuItem!.id);
      this.menuitems[index] = { ...this.newMenuItem, id: this.selectedMenuItem!.id };
    } else {
      this.menuitems.push({ ...this.newMenuItem, id: Date.now() });
    }

    this.toggleForm();
  }

  // Delete item by ID
  deleteMenuItem(id: number) {
    this.menuitems = this.menuitems.filter(item => item.id !== id);
    this.showForm = this.menuitems.length === 0;
  }

  // Handle image upload
  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newMenuItem.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Initialize a new empty menu item
  private initMenuItem(): MenuItem {
    return {
      name: '',
      type: 'Veg',
      image: '',
    };
  }
}
