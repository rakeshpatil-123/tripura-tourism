import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDepartmentApplicationsComponent } from './all-department-applications.component';

describe('AllDepartmentApplicationsComponent', () => {
  let component: AllDepartmentApplicationsComponent;
  let fixture: ComponentFixture<AllDepartmentApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDepartmentApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDepartmentApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
