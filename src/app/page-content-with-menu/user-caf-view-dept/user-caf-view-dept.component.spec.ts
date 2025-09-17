import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCafViewDeptComponent } from './user-caf-view-dept.component';

describe('UserCafViewDeptComponent', () => {
  let component: UserCafViewDeptComponent;
  let fixture: ComponentFixture<UserCafViewDeptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCafViewDeptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCafViewDeptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
