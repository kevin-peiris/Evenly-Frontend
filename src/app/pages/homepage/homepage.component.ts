import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { NavBarComponent } from '../../common/nav-bar-sign/nav-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, NavBarComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  mainTitle = 'Less stress when sharing expenses on trips.';
  mainDescription = 'Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.';
  mainImage = 'house.png';
  mainColor = 'text-primary';

  ngOnInit() {
    if (typeof document !== 'undefined') {
      AOS.init({
        duration: 1000, // Sets the animation duration in milliseconds
      });
    }
  }

  updateContent(newTitle: string, newDescription: string, newImage: string) {
    this.mainTitle = `Less stress when sharing expenses ${newTitle}`;
    this.mainDescription = newDescription;
    this.mainImage = newImage;
  }
  
}

