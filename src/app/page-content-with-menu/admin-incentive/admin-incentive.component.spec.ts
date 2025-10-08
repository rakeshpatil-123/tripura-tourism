import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIncentiveComponent } from './admin-incentive.component';

describe('AdminIncentiveComponent', () => {
  let component: AdminIncentiveComponent;
  let fixture: ComponentFixture<AdminIncentiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIncentiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIncentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
