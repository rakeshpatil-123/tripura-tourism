import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineSingleWindowReportComponent } from './online-single-window-report.component';

describe('OnlineSingleWindowReportComponent', () => {
  let component: OnlineSingleWindowReportComponent;
  let fixture: ComponentFixture<OnlineSingleWindowReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineSingleWindowReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineSingleWindowReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
