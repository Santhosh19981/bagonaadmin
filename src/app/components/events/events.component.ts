import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  allEvents: any[] = [];
  filteredEvents: any[] = [];
  paginatedEvents: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedEvent: any = null;
  imagePreviewUrl: string | null = null;

  // Delete Modal
  showDeleteConfirm: boolean = false;
  eventIdToDelete: number | null = null;

  newEvent: any = {
    name: '',
    description: '',
    status: 'active',
    image: null,
    image_url: ''
  };
  defaultEventImage = "https://cdn-icons-png.flaticon.com/512/3652/3652191.png";
  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadEvents();
  }

  // Load events
  loadEvents() {
    this.apiService.getEvents().subscribe({
      next: (res: any) => {
        this.allEvents = Array.isArray(res?.data) ? res.data : [];
        this.applyFilter('');
      },
      error: (err) => {
        console.error("❌ Error loading events:", err);
        this.allEvents = [];
        this.applyFilter('');
      }
    });
  }

  onSearch(query: string) {
    this.applyFilter(query);
  }

  applyFilter(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredEvents = [...this.allEvents];
    } else {
      this.filteredEvents = this.allEvents.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.updatePaginatedEvents();
  }

  updatePaginatedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(start, end);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedEvents();
    }
  }

  onToggleChange(event: any) {
    const isChecked = event.target.checked;
    this.newEvent.status = isChecked ? 'active' : 'inactive';
  }

  // Toggle Form
  toggleForm(event?: any) {
    this.showForm = !this.showForm;
    this.imagePreviewUrl = null;

    if (event) {
      this.selectedEvent = { ...event };
      this.newEvent = { ...event, image: null }; // Initialize form with event data
      this.imagePreviewUrl = event.image_url;
    } else {
      this.selectedEvent = null;
      this.newEvent = {
        name: '',
        description: '',
        status: 'active',  // active by default for new events
        image_url: ''
      };
    }
  }

  onImageError(event: any) {
    event.target.src = this.defaultEventImage;
  }

  // Image Upload with Preview
  onImageChange(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.newEvent.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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
          this.toastr.success(res.message || "Event updated successfully!");
          this.showForm = false;
          this.loadEvents();
        },
        error: (err) => {
          this.toastr.error(err.message || "Update failed!");
        }
      });

    } else {
      this.apiService.createEvent(fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Event created successfully!");
          this.showForm = false;
          this.loadEvents();
        },
        error: (err) => {
          this.toastr.error(err.message || "Creation failed!");
        }
      });
    }
  }

  // Custom Delete Flow
  deleteEvent(id: number) {
    this.eventIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.eventIdToDelete) {
      this.apiService.deleteEvent(this.eventIdToDelete).subscribe({
        next: () => {
          this.toastr.success("Event deleted successfully");
          this.loadEvents();
          this.cancelDelete();
        },
        error: () => {
          this.toastr.error("Failed to delete event");
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.eventIdToDelete = null;
  }
}