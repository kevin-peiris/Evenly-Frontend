import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { NavBarComponent } from './common/nav-bar-sign/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomepageComponent,RouterOutlet,NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Expense-Share';
}
