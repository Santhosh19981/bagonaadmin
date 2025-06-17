import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";

@Component({
  selector: 'app-users',
  imports: [CommonModule, SidemenuComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

}
