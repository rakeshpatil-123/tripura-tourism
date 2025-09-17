import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserApplicationViewComponent } from './user-application-view.component';

describe('UserApplicationViewComponent', () => {
  let component: UserApplicationViewComponent;
  let fixture: ComponentFixture<UserApplicationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserApplicationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserApplicationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
