import { Component } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  events: any[] = [];
  showForm = false;
  selectedEvent: any = null;

  newEvent: any = {
    name: '',
    description: '',
    status: 'inactive',
    image: null
  };
  defaultEventImage = "https://img.icons8.com/?size=512&id=23264&format=png";
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadEvents();
  }

  // Load events
loadEvents() {
  this.apiService.getEvents().subscribe({
    next: (res: any) => {
      this.events = Array.isArray(res?.data) ? res.data : [];
     
    },
    error: (err) => {
      console.error("❌ Error loading events:", err);
      this.events = [];
      
    }
  });
}

  onToggleChange(event: any) {
    const isChecked = event.target.checked;
    this.newEvent.status = isChecked ? 'active' : 'inactive';
  }
  // Toggle Form
  toggleForm(event?: any) {
    this.showForm = !this.showForm;

    if (event) {
      this.newEvent = this.selectedEvent =  { ...event }; // Editing existing event
    } else {
      this.newEvent = {
        name: '',
        description: '',
        status: 'inactive',  // default
        image_url: ''
      };
    }
  }

  onImageError(event: any) {
  event.target.src = this.defaultEventImage;
}


  // Image Upload
  onImageChange(e: any) {
    this.newEvent.image = e.target.files[0];
  }

  // Save Event (Create or Update)
 saveEvent() {
  const fd = new FormData();

  fd.append('name', this.newEvent.name);
  fd.append('description', this.newEvent.description);
  fd.append('status', this.newEvent.status);

  if (this.newEvent.image instanceof File) {
    fd.append('image', this.newEvent.image);
  }

  if (this.selectedEvent) {
    fd.append('existingImage', this.selectedEvent.image_url);

    this.apiService.updateEvent(this.selectedEvent.event_id, fd).subscribe({
      next: (res: any) => {
        alert(res.message);      // 🔥 show success message
        this.showForm = false;
        this.loadEvents();
      },
      error: (err) => {
        alert("Update failed! " + err.message);   // ❌ show error message
      }
    });

  } else {
    this.apiService.createEvent(fd).subscribe({
      next: (res: any) => {
        alert(res.message);      // 🔥 show success message
        this.showForm = false;
        this.loadEvents();
      },
      error: (err) => {
        alert("Create failed! " + err.message);   // ❌ show error message
      }
    });
  }
}


  // Delete Event
  deleteEvent(id: number) {
    if (confirm('Delete this event?')) {
      this.apiService.deleteEvent(id).subscribe(() => {
        this.loadEvents();
      });
    }
  }
}