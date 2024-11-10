import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';

@Component({
  selector: 'app-nav-bar-user',
  standalone: true,
  imports: [RouterLink,NgbModule],
  templateUrl: './nav-bar-user.component.html',
  styleUrl: './nav-bar-user.component.css'
})
export class NavBarUserComponent implements OnInit {
  user:any;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  

  signOut(){
    this.userService.setUser(null);
    this.router.navigate([' ']);
  }
}
