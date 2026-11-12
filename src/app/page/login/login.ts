import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../service/auth/auth';
import { getLoginDestination } from '../../service/auth/auth.redirect';
import { Viewport } from '../../service/viewport/viewport';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isMobile = inject(Viewport).isMobile;
  protected readonly loginForm = inject(FormBuilder).nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly errorMessage = signal('');

  protected onSubmit(): void {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('請輸入帳號與密碼');
      return;
    }

    if (!this.auth.login(this.loginForm.getRawValue())) {
      this.errorMessage.set('帳號或密碼錯誤');
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(
      getLoginDestination(this.router, returnUrl),
      { replaceUrl: true },
    );
  }

  images = [
    { url: '/images/school_photo/1.jpg', position: 'center' },
    { url: '/images/school_photo/2.jpg', position: '70% center' },
    { url: '/images/school_photo/3.jpg', position: '30% center' },
  ]
  randomImage = this.images[Math.floor(Math.random() * this.images.length)];
}
