import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;

    this.apiService.loginUser(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res && res.token && res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('isLoggedIn', 'true');

          // ✅ Backend already checks role_id === 4, but keeping double safety check
          if (res.user.role === 4) {
            this.toastr.success('Login Successful! Welcome back.', 'Success');
            this.router.navigate(['/dashboard']); // ✅ Navigate to dashboard
          } else {
            this.toastr.error('Access denied. Invalid role.', 'Error');
          }
        } else {
          this.toastr.error('Invalid response from server', 'Error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Invalid username or password', 'Login Failed');
      }
    });
  }
}
