import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";

@Component({
  selector: 'app-cheffs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './cheffs.component.html',
  styleUrl: './cheffs.component.scss'
})
export class CheffsComponent {
  cheffs = [
    { id: 1, name: 'Ravi Kumar', phone: '9876543210', email: 'ravi@example.com', experience: '5 years', address: 'Delhi' },
    { id: 2, name: 'Anita Sharma', phone: '8765432109', email: 'anita@example.com', experience: '3 years', address: 'Mumbai' },
    { id: 3, name: 'Joseph Mathew', phone: '9123456789', email: 'joseph@example.com', experience: '8 years', address: 'Bangalore' }
  ];

  showForm = false;
  selectedCheff: any = null;
  newCheff = this.initCheff();

  toggleForm(cheff: any = null) {
    this.selectedCheff = cheff;
    this.newCheff = cheff ? { ...cheff } : this.initCheff();
    this.showForm = !this.showForm;
  }

  saveCheff() {
    if (this.selectedCheff) {
      const index = this.cheffs.findIndex(c => c.id === this.selectedCheff.id);
      this.cheffs[index] = { ...this.newCheff, id: this.selectedCheff.id };
    } else {
      this.cheffs.push({ ...this.newCheff, id: Date.now() });
    }
    this.toggleForm();
  }

  deleteCheff(id: number) {
    this.cheffs = this.cheffs.filter(c => c.id !== id);
     this.showForm = this.cheffs.length === 0;
  }

  private initCheff() {
    return { name: '', phone: '', email: '', experience: '', address: '' };
  }
}
