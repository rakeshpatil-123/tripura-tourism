import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryReportDetailsComponent } from './industry-report-details.component';

describe('IndustryReportDetailsComponent', () => {
  let component: IndustryReportDetailsComponent;
  let fixture: ComponentFixture<IndustryReportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryReportDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
