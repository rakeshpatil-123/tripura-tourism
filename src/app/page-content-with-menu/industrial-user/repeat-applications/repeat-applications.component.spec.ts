import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatApplicationsComponent } from './repeat-applications.component';

describe('RepeatApplicationsComponent', () => {
  let component: RepeatApplicationsComponent;
  let fixture: ComponentFixture<RepeatApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
