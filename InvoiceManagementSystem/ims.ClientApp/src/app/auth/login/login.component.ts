import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../auth.service';
import { AuthStore } from '../auth.store';
import { UserService } from '../../users/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  currentYear = new Date().getFullYear();
  form!: FormGroup;

  passwordVisible = false;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService, private authStore: AuthStore, private users: UserService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false],
      twoFactorCode: [null],
      twoFactorRecoveryCode: [null]
    });
  }

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: LoginRequest = {
      email: this.form.value.email,
      password: this.form.value.password,
      twoFactorCode: this.form.value.twoFactorCode,
      twoFactorRecoveryCode: this.form.value.twoFactorRecoveryCode
    };

    this.auth.login(payload).subscribe({
      next: (res) => {
        if (res?.token) {
          this.authStore.setToken(res.token);
        }
        // If token didn't include a name, try response FullName or given/family
        if (!this.authStore.userName()) {
          const r: any = res || {};
          const fullName = r.FullName || r.fullName || r.fullname || r.name;
          const composed = [r.given_name || r.givenName, r.family_name || r.familyName].filter(Boolean).join(' ').trim();
          const finalName = fullName || composed || '';
          if (finalName) this.authStore.userName.set(finalName);
        }
        // If still no name, try fetching user profile by sub (userId)
        const uid = this.authStore.userId();
        if (!this.authStore.userName() && uid) {
          this.users.getById(uid).subscribe({
            next: (profile) => {
              const p: any = profile || {};
              const fullName = p.FullName || p.fullName || p.fullname || p.name;
              const composed = [p.given_name || p.firstName, p.family_name || p.lastName].filter(Boolean).join(' ').trim();
              const finalName = fullName || composed || '';
              if (finalName) this.authStore.userName.set(finalName);
            },
            complete: () => {
              this.router.navigateByUrl('/home');
            },
            error: () => {
              this.router.navigateByUrl('/home');
            }
          });
        } else {
          this.router.navigateByUrl('/home');
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'Login failed');
      }
    });
  }
}
