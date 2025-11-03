import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepartmentalJointInspectionComponent } from './add-departmental-joint-inspection.component';

describe('AddDepartmentalJointInspectionComponent', () => {
  let component: AddDepartmentalJointInspectionComponent;
  let fixture: ComponentFixture<AddDepartmentalJointInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDepartmentalJointInspectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDepartmentalJointInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
