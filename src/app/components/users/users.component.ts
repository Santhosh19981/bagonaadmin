import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SidemenuComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: any[] = [];

  // Default users data if none in localStorage
  defaultUsers = [
    {
      name: 'Micheal John',
      phone: '9876541230',
      email: 'micheal.john@mail.com',
      registerDate: '18-10-2021',
      avatar: 'https://cdn-icons-png.flaticon.com/512/8792/8792047.png'
    },
    {
      name: 'Anna Hines',
      phone: '9123456789',
      email: 'anna.hines@mail.com',
      registerDate: '22-02-2022',
      avatar: 'https://cdn-icons-png.flaticon.com/512/147/147144.png'
    },
    {
      name: 'John Doe',
      phone: '9988776655',
      email: 'john.doe@mail.com',
      registerDate: '05-12-2020',
      avatar: 'https://cdn-icons-png.flaticon.com/512/147/147142.png'
    }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      this.users = this.defaultUsers;
      localStorage.setItem('users', JSON.stringify(this.defaultUsers));
    }
  }

  deleteUser(index: number) {
    this.users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(this.users));
  }
}
