import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalApplicationSubmissionComponent } from './renewal-application-submission.component';

describe('RenewalApplicationSubmissionComponent', () => {
  let component: RenewalApplicationSubmissionComponent;
  let fixture: ComponentFixture<RenewalApplicationSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewalApplicationSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalApplicationSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
