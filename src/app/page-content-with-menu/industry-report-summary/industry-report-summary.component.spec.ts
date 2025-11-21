import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryReportSummaryComponent } from './industry-report-summary.component';

describe('IndustryReportSummaryComponent', () => {
  let component: IndustryReportSummaryComponent;
  let fixture: ComponentFixture<IndustryReportSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryReportSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryReportSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
