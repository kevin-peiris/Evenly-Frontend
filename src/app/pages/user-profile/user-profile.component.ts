import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('emailMsg') emailMsg!: ElementRef;
  @ViewChild('passwordMsg') passwordMsg!: ElementRef;

  async updateDetails() {
    if (!this.isValidEmail(this.user.email)) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Invalid Email!';
      this.user.email = "";
    } else if (!this.isValidPassword(this.user.password)) {
      this.passwordMsg.nativeElement.style.color = 'red';
      this.passwordMsg.nativeElement.innerText = 'Invalid Password!';
      this.user.password = "";
    } else if (await this.callApiWithEmail(this.user.email)) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Email Already in the System!';
      this.user = { name: "", email: "", password: "" };
    } else {
      this.http.put("http://localhost:8080/users/update", this.user, { responseType: 'text' })
      .subscribe((data) => {
        this.userService.setUser(this.user);
        this.router.navigate(['/user-main/user-dashboard']);
      });

    }

   
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  async callApiWithEmail(email: string): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:8080/users/${email}`);
      if (response.ok) {
        const data = await response.json();
        return data !== null;
      }
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }

}
