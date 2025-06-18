import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidemenu',
  imports: [],
  templateUrl: './sidemenu.component.html',
  styleUrl: './sidemenu.component.scss'
})
export class SidemenuComponent {
   @Input() menuFromParent: string = '';
  menu:string = "dashboard";

  constructor(private router: Router){

  }


  ngOnInit(): void {
    if (this.menuFromParent) {
      this.gotoMenu(this.menuFromParent);
    }
  }
  logout(){
     this.router.navigate(['/']);
  }

  gotoMenu(route: string) {
    this.menu = route;
    switch (route) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'cheffs':
        this.router.navigate(['/cheffs']);
        break;
      case 'orders':
        this.router.navigate(['/orders']);
        break;
      case 'payment-history':
        this.router.navigate(['/payment-history']);
        break;
      case 'users':
        this.router.navigate(['/users']);
        break;
      case 'vendors':
        this.router.navigate(['/vendors']);
        break;
      default:
        break;
    }
  }
}