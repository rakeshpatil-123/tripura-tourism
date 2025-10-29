import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveApplicationDetailsComponent } from './incentive-application-details.component';

describe('IncentiveApplicationDetailsComponent', () => {
  let component: IncentiveApplicationDetailsComponent;
  let fixture: ComponentFixture<IncentiveApplicationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveApplicationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
