import { Component, ElementRef, ViewChild } from '@angular/core';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { NavBarComponent } from '../../common/nav-bar-sign/nav-bar.component';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [RouterLink, NavBarComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {

  mainTitle = 'Less stress when sharing expenses on trips.';
  mainDescription = 'Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.';
  mainImage = 'house.png';
  mainColor = 'text-primary';

  updateContent(newTitle: string, newDescription: string, newImage: string) {
    this.mainTitle = `Less stress when sharing expenses ${newTitle}`;
    this.mainDescription = newDescription;
    this.mainImage = newImage;
  }

  public signUser: any = {
    name: "",
    email: "",
    password: ""
  };

  constructor(private http: HttpClient, private userService: UserService, private router: Router) { }

  @ViewChild('emailMsg') emailMsg!: ElementRef;
  @ViewChild('passwordMsg') passwordMsg!: ElementRef;

  public async signUp(): Promise<void> {
    this.emailMsg.nativeElement.innerText = '';
    this.passwordMsg.nativeElement.innerText = '';

    if (!this.isValidEmail(this.signUser.email)) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Invalid Email!';
      this.signUser.email = "";
    } else if (!this.isValidPassword(this.signUser.password)) {
      this.passwordMsg.nativeElement.style.color = 'red';
      this.passwordMsg.nativeElement.innerText = 'Invalid Password!';
      this.signUser.password = "";
    } else if (await this.callApiWithEmail(this.signUser.email)) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Email Already in the System!';
      this.signUser = { name: "", email: "", password: "" };
    } else {
      this.http.post("http://localhost:8080/users/register", this.signUser, { responseType: 'text' })
        .subscribe((data) => {
          this.userService.setUser(this.signUser);
          this.signUser = { name: "", email: "", password: "" };
          this.router.navigate(['user-dashboard']);
        });
    }
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
