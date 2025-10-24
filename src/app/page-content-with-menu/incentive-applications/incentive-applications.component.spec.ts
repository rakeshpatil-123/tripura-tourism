import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveApplicationsComponent } from './incentive-applications.component';

describe('IncentiveApplicationsComponent', () => {
  let component: IncentiveApplicationsComponent;
  let fixture: ComponentFixture<IncentiveApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
