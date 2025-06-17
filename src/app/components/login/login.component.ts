import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup ,ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports : [ReactiveFormsModule],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;  

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize form inside ngOnInit or constructor
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    if (username === '9160684944' && password === 'admin@123') {
      debugger
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Invalid username or password');
    }
  }
}
