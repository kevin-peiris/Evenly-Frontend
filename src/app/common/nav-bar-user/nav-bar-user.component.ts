import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nav-bar-user',
  standalone: true,
  imports: [RouterLink, NgbModule],
  templateUrl: './nav-bar-user.component.html',
  styleUrl: './nav-bar-user.component.css'
})
export class NavBarUserComponent implements OnInit {
  user: any;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  signOut() {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign-out!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "You have signed out successfully!",
          icon: "success"
        }).then(() => {
          this.userService.setUser(null);
          this.router.navigate([' ']);
        });
      }
    });
  }


}
