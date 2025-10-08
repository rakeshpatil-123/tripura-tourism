import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationReportComponent } from './registration-report.component';

describe('RegistrationReportComponent', () => {
  let component: RegistrationReportComponent;
  let fixture: ComponentFixture<RegistrationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
