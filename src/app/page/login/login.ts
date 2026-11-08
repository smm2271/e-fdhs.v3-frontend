import { Component, inject } from '@angular/core';
import { Viewport } from '../../service/viewport/viewport';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  protected readonly isMobile = inject(Viewport).isMobile;
  images = [
    { url: '/images/school_photo/1.jpg', position: 'center' },
    { url: '/images/school_photo/2.jpg', position: '70% center' },
    { url: '/images/school_photo/3.jpg', position: '30% center' },
  ]
  randomImage = this.images[Math.floor(Math.random() * this.images.length)];
}
