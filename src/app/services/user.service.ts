import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private userSource = new BehaviorSubject<any>({id: "",name: "", email: "", password: "" });
  public currentUser = this.userSource.asObservable();

  setUser(user: any) {
    this.userSource.next(user);
  }

  getUser() {
    return this.userSource.getValue();
  }
}
