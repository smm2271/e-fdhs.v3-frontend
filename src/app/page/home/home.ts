import { KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../service/auth/auth';
import { PageService } from '../../service/page/page';

@Component({
  selector: 'app-home',
  imports: [KeyValuePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly user = inject(Auth).currentUser;
  protected readonly groups = inject(PageService).navGroups;
}
