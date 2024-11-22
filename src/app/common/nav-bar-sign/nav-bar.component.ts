import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2'

declare var bootstrap: any;

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

  constructor(private userService: UserService, private router: Router) { }

  private userInput: any = {
    email: '',
    password: ''
  };

  @ViewChild('emailMsg') emailMsg!: ElementRef;
  @ViewChild('passwordMsg') passwordMsg!: ElementRef;
  @ViewChild('logInModal') logInModal!: ElementRef;

  private user: any = null;

  get email() {
    return this.userInput.email;
  }
  set email(value: string) {
    if (this.userInput.email !== value) {
      this.userInput.email = value;
      this.callApiWithEmail(this.userInput.email);
    }
  }

  get password() {
    return this.userInput.password;
  }
  set password(value: string) {
    if (this.userInput.password !== value) {
      this.userInput.password = value;
    }
  }

  async callApiWithEmail(email: string) {
    try {
      const res = await fetch(`http://localhost:8080/users/${email}`);
      const data = await res.json();
      this.checkUser(data);
    } catch {
      this.checkUser(null);
    }
  }

  checkUser(data: any) {
    if (data == null) {
      this.emailMsg.nativeElement.style.color = 'red';
      this.emailMsg.nativeElement.innerText = 'Email Not Found in the System!';
    } else {
      this.emailMsg.nativeElement.style.color = 'green';
      this.emailMsg.nativeElement.innerText = 'Email Found!';
      this.user = data;
    }
  }

  async logIn() {
    if (this.password !== this.user?.password || this.user == null || !this.isValidPassword(this.password)) {
      this.passwordMsg.nativeElement.style.color = 'red';
      this.passwordMsg.nativeElement.innerText = 'Invalid password!';
    } else {
      this.passwordMsg.nativeElement.style.color = 'green';
      this.passwordMsg.nativeElement.innerText = 'LogIn Success.';
      this.userService.setUser(this.user);
      this.userInput.email = "";
      this.userInput.password = "";

      const modalInstance = bootstrap.Modal.getInstance(this.logInModal.nativeElement) ||
        new bootstrap.Modal(this.logInModal.nativeElement);
      modalInstance.hide();

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Login Successfully!",
        showConfirmButton: false,
        timer: 1500
      });

      
      this.router.navigate(['/user-main/user-dashboard']);
    }
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  forgotUser: any = null;
  private Email: string = '';
  otp: string = '';
  newPassword: string = '';

  @ViewChild('forgotEmailMsg') forgotEmailMsg!: ElementRef;
  @ViewChild('newPasswordMsg') newPasswordMsg!: ElementRef;

  get forgotEmail() {
    return this.Email;
  }
  set forgotEmail(value: string) {
    if (this.Email !== value) {
      this.Email = value;
      this.getForgotEmail(this.Email);
    }
  }

  async getForgotEmail(email: string) {
    try {
      const response = await fetch(`http://localhost:8080/users/${email}`);
      const data = await response.json();
      if (response.ok) {
        this.forgotUser = data;
        this.forgotEmailMsg.nativeElement.style.color = 'green';
        this.forgotEmailMsg.nativeElement.innerText = 'Email Found!';
      } else {
        throw new Error('Email Not Found in the System!');
      }
    } catch (error) {
      this.forgotUser = null;
      this.forgotEmailMsg.nativeElement.style.color = 'red';
      this.forgotEmailMsg.nativeElement.innerText = 'Email Not Found in the System!';
    }
  }

  async sendOtp(): Promise<void> {
    if (this.forgotUser != null) {
      try {
        const response = await fetch(`http://localhost:8080/users/send-otp?email=${this.forgotEmail}`, {
          method: 'POST'
        });

        if (response.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "OTP sent to your email.",
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Error sending OTP.",
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch (error) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error "+ (error as Error).message,
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.isValidPassword(this.newPassword)) {
      this.newPasswordMsg.nativeElement.style.color = 'red';
      this.newPasswordMsg.nativeElement.innerText = 'Invalid Password!';
    } else {
      try {
        const response = await fetch(`http://localhost:8080/users/reset-password?email=${this.forgotEmail}&otp=${this.otp}&newPassword=${this.newPassword}`, {
          method: 'POST'
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const data = await response.text();
        Swal.fire({
          position: "center",
          icon: "success",
          title: data,
          showConfirmButton: false,
          timer: 1500
        });
        
        this.otp = '';
        this.newPassword = '';
        this.forgotUser = null;
      } catch (error) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error "+ (error as Error).message,
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  }
}
