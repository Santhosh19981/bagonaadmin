import { Component } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  events = [
    { id: 1, eventname: 'Marriage', description: '', Active: 'Active', image: '' },
    { id: 2, eventname: 'Mehandhi', description: '', Active: 'Inactive', image: '' },
    { id: 3, eventname: 'Halfsaree', description: '', Active: 'Active', image: '' }
  ];

  showForm = false;
  selectedEvent: any = null;
  newEvent = this.initEvent();

  // Toggle form (edit or create)
  toggleForm(event: any = null) {
    this.selectedEvent = event;
    this.newEvent = event ? { ...event } : this.initEvent();
    this.showForm = !this.showForm;
  }

  // Save event (create or update)
  saveEvent() {
    if (this.selectedEvent) {
      const index = this.events.findIndex(e => e.id === this.selectedEvent.id);
      this.events[index] = { ...this.newEvent, id: this.selectedEvent.id };
    } else {
      this.events.push({ ...this.newEvent, id: Date.now() });
    }
    this.toggleForm();
  }

  // Delete event by ID
  deleteEvent(id: number) {
    this.events = this.events.filter(e => e.id !== id);
    this.showForm = this.events.length === 0;
  }

  // Image upload
  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newEvent.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
onToggleChange(event: Event) {
  const input = event.target as HTMLInputElement;
  this.newEvent.Active = input.checked ? 'Active' : 'Inactive';
}
toggleActive(event: any) {
  event.Active = event.Active === 'Active' ? 'Inactive' : 'Active';
}
  // Reset new event form
  private initEvent() {
    return {
      eventname: '',
      description: '',
      Active: 'Inactive',
      image: ''
    };
  }
}
