import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarUserComponent } from './nav-bar-user.component';

describe('NavBarUserComponent', () => {
  let component: NavBarUserComponent;
  let fixture: ComponentFixture<NavBarUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavBarUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
