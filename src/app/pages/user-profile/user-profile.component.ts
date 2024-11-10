import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavBarUserComponent } from '../../common/nav-bar-user/nav-bar-user.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NavBarUserComponent,RouterOutlet],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

}
