import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavBarUserComponent } from '../../common/nav-bar-user/nav-bar-user.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

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
    this.emailMsg.nativeElement.innerText = '';
    this.passwordMsg.nativeElement.innerText = '';
  
    if (!this.isValidEmail(this.user.email)) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Invalid Email!';
      return;
    }

    if (!this.isValidPassword(this.user.password)) {
      this.passwordMsg.nativeElement.style.color = 'red';
      this.passwordMsg.nativeElement.innerText =
        'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.';
      return;
    }
  
    const currentUser = this.userService.getUser();
    if (currentUser?.email === this.user.email) {
      console.log("Email has not been changed. Skipping API check.");
    } else if (await this.callApiWithEmail(this.user.email)) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Email is already in the system!';
      return;
    }
  
    this.http
      .put("http://localhost:8080/users/update", this.user, {
        responseType: 'text',
      })
      .subscribe((data) => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Profile Updated Successfully!",
          showConfirmButton: false,
          timer: 1500
        });
        this.userService.setUser(this.user);
        this.router.navigate(['/user-main/user-dashboard']);
      });
  }
  
  

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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
