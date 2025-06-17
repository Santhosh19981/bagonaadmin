import { Component } from '@angular/core';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";

@Component({
  selector: 'app-dashboard',
  imports: [SidemenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
