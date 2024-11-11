import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavBarUserComponent } from '../../common/nav-bar-user/nav-bar-user.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  mainTitle = 'Less stress when sharing expenses on trips.';
  mainDescription = 'Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.';
  mainImage = 'house.png';
  mainColor = 'text-primary';

  updateContent(newTitle: string, newDescription: string, newImage: string) {
    this.mainTitle = `Less stress when sharing expenses ${newTitle}`;
    this.mainDescription = newDescription;
    this.mainImage = newImage;
  }

  public user: any = {
    name: "",
    email: "",
    password: ""
  };

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  constructor(private http: HttpClient, private userService: UserService, private router: Router) { }

  updateDetails() {
    this.http.put("http://localhost:8080/users/update", this.user, { responseType: 'text' })
        .subscribe((data) => {
          this.userService.setUser(this.user);
          this.router.navigate(['/user-main/user-dashboard']);
        });
  }

}
