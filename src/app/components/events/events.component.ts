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

  // API Base URL - update this to your production URL when deploying
  apiBaseUrl: string = "https://bhagona-backend-v2.vercel.app";

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // State
  showForm = false;
  selectedEvent: any = null;
  imagePreviewUrl: string | null = null;
  isNewImageSelected: boolean = false;

  // Delete Modal
  showDeleteConfirm: boolean = false;
  eventIdToDelete: number | null = null;

  newEvent: any = {
    name: '',
    description: '',
    status: 'active', // default
    image: null,
    image_url: ''
  };

  defaultEventImage = "https://cdn-icons-png.flaticon.com/512/3652/3652191.png";

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.apiService.getEvents().subscribe({
      next: (res: any) => {
        this.allEvents = Array.isArray(res?.data) ? res.data : [];
        this.applyFilter('');
      },
      error: (err) => {
        console.error("❌ Error loading events:", err);
        this.toastr.error("Failed to load events");
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
    this.newEvent.status = event.target.checked ? 'active' : 'inactive';
  }

  toggleForm(event?: any) {
    this.showForm = !this.showForm;
    this.imagePreviewUrl = null;
    this.isNewImageSelected = false;

    if (event) {
      this.selectedEvent = { ...event };
      this.newEvent = { ...event, image: null };
      this.imagePreviewUrl = event.image_url;
    } else {
      this.selectedEvent = null;
      this.newEvent = {
        name: '',
        description: '',
        status: 'active',
        image: null,
        image_url: ''
      };
    }
  }

  onImageError(event: any) {
    event.target.src = this.defaultEventImage;
  }

  // Handle file selection from input
  onImageChange(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.newEvent.image = file;
      this.isNewImageSelected = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string; // Set base64 preview
      };
      reader.readAsDataURL(file);
    }
  }

  // Determine the correct image source for display
  getImageSrc(imageUrl: string | null): string {
    if (!imageUrl) return this.defaultEventImage;
    if (imageUrl.startsWith('data:')) return imageUrl; // Return base64 preview as is
    if (imageUrl.startsWith('http')) return imageUrl; // Original full URL

    // Check if it's a local file path (e.g., from an old DB entry or misconfiguration)
    if (imageUrl.includes(':/') || imageUrl.includes(':\\')) {
      return this.defaultEventImage;
    }

    return this.apiBaseUrl + imageUrl; // Prefix relative server path with API URL
  }

  saveEvent() {
    const fd = new FormData();
    fd.append('name', this.newEvent.name);
    fd.append('description', this.newEvent.description || '');
    fd.append('status', this.newEvent.status);

    // If there's a new file selected, upload it
    if (this.newEvent.image instanceof File) {
      fd.append('image', this.newEvent.image);
    }

    if (this.selectedEvent) {
      // If we are updating and NO new image was selected, 
      // tell the backend to keep the existing one.
      if (!this.isNewImageSelected) {
        fd.append('existingImage', this.selectedEvent.image_url);
      }

      this.apiService.updateEvent(this.selectedEvent.event_id, fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Event updated!");
          this.showForm = false;
          this.loadEvents();
        },
        error: (err) => this.toastr.error(err.message || "Update failed")
      });
    } else {
      this.apiService.createEvent(fd).subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || "Event created!");
          this.showForm = false;
          this.loadEvents();
        },
        error: (err) => this.toastr.error(err.message || "Creation failed")
      });
    }
  }

  deleteEvent(id: number) {
    this.eventIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.eventIdToDelete) {
      this.apiService.deleteEvent(this.eventIdToDelete).subscribe({
        next: () => {
          this.toastr.success("Event deleted");
          this.loadEvents();
          this.cancelDelete();
        },
        error: () => this.toastr.error("Delete failed")
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.eventIdToDelete = null;
  }
}