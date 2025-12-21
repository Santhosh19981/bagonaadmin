import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService, MenuItem } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidemenu',
  imports: [CommonModule],
  templateUrl: './sidemenu.component.html',
  styleUrl: './sidemenu.component.scss'
})
export class SidemenuComponent implements OnInit {
  @Input() menuFromParent: string = '';
  menu: string = "dashboard";
  menuItems: MenuItem[] = [];
  userName: string = '';
  userRole: number | null = null;

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    // Get user info
    this.userRole = this.navigationService.getCurrentUserRole();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.name || 'User';
      } catch (e) {
        this.userName = 'User';
      }
    }

    // Load menu items based on user role
    if (this.userRole) {
      this.menuItems = this.navigationService.getMenuByRole(this.userRole);
    }

    // Set initial menu from parent input
    if (this.menuFromParent) {
      this.gotoMenu(this.menuFromParent);
    }
  }

  logout() {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  gotoMenu(menuId: string) {
    this.menu = menuId;
    const menuItem = this.menuItems.find(item => item.id === menuId);
    if (menuItem) {
      this.router.navigate([menuItem.route]);
    }
  }
}