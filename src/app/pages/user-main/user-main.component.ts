import { Component } from '@angular/core';
import { NavBarUserComponent } from '../../common/nav-bar-user/nav-bar-user.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-main',
  standalone: true,
  imports: [NavBarUserComponent,RouterOutlet],
  templateUrl: './user-main.component.html',
  styleUrl: './user-main.component.css'
})
export class UserMainComponent {

}
