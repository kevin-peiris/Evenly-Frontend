import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private groupSource = new BehaviorSubject<any>({id: "", name: "", email: "", password: "" });
  public currentGroup = this.groupSource.asObservable();

  setGroup(group: any) {
    this.groupSource.next(group);
  }

  getGroup() {
    return this.groupSource.getValue();
  }
}
