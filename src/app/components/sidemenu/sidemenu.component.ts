import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService, MenuItem } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidemenu.component.html',
  styleUrl: './sidemenu.component.scss'
})
export class SidemenuComponent implements OnInit {
  @Input() menuFromParent: string = '';
  @Output() sidebarToggle = new EventEmitter<boolean>();

  menuItems: any[] = [];
  userName: string = 'Admin';
  userRole: number | null = null;

  // Mobile state management - MUST start with sidebar closed
  isMobileView: boolean = false;
  isSidebarOpen: boolean = false;

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {
    // Initialize mobile view state immediately in constructor
    this.checkMobileView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }

  ngOnInit(): void {
    // Ensure mobile view is checked first
    this.checkMobileView();

    // Force sidebar to be closed on mobile on initial load
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }

    // Get user info and role
    this.userRole = this.navigationService.getCurrentUserRole();

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.name || 'Admin';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Get menu items based on user role
    if (this.userRole !== null) {
      this.menuItems = this.navigationService.getMenuByRole(this.userRole);
    }
  }

  checkMobileView(): void {
    const wasMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint

    // When switching from mobile to desktop, ensure sidebar is closed
    if (!this.isMobileView && wasMobileView) {
      this.isSidebarOpen = false;
    }

    // When switching to mobile view, ensure sidebar is closed
    if (this.isMobileView && !wasMobileView) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.sidebarToggle.emit(this.isSidebarOpen);
  }

  closeSidebar(): void {
    if (this.isMobileView) {
      this.isSidebarOpen = false;
      this.sidebarToggle.emit(false);
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
