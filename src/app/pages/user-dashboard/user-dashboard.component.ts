import { Component } from '@angular/core';
import { NavBarUserComponent } from '../../common/nav-bar-user/nav-bar-user.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [NavBarUserComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  user:any;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => {
      this.user = user;
      console.log(user);
    });
  }

  
}
