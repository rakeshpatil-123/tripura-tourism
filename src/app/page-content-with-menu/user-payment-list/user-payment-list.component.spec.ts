import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPaymentListComponent } from './user-payment-list.component';

describe('UserPaymentListComponent', () => {
  let component: UserPaymentListComponent;
  let fixture: ComponentFixture<UserPaymentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPaymentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
