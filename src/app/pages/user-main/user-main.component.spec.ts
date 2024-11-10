import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMainComponent } from './user-main.component';

describe('UserMainComponent', () => {
  let component: UserMainComponent;
  let fixture: ComponentFixture<UserMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
