import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSubmissionComponent } from './application-submission.component';

describe('ApplicationSubmissionComponent', () => {
  let component: ApplicationSubmissionComponent;
  let fixture: ComponentFixture<ApplicationSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
