import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
  imports : [CommonModule]
})
export class SidemenuComponent implements OnInit {
  menu: string = 'dashboard';

  constructor(private router: Router) {}

  ngOnInit() {
    debugger; 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        if (currentUrl.includes('/dashboard')) {
          this.menu = 'dashboard';
        } else if (currentUrl.includes('/cheffs')) {
          this.menu = 'cheffs';
        } else if (currentUrl.includes('/orders')) {
          this.menu = 'orders';
        } else if (currentUrl.includes('/payment-history')) {
          this.menu = 'payment-history';
        } else if (currentUrl.includes('/users')) {
          this.menu = 'users';
        } else if (currentUrl.includes('/vendors')) {
          this.menu = 'vendors';  
        }
      }
    });
  }

  gotoMenu(route: string) {
    this.menu = route;
    this.router.navigate([`/${route}`]);
  }
}
