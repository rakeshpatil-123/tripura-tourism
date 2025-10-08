import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveReportComponent } from './incentive-report.component';

describe('IncentiveReportComponent', () => {
  let component: IncentiveReportComponent;
  let fixture: ComponentFixture<IncentiveReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
