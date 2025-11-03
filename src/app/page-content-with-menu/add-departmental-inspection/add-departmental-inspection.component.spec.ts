import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepartmentalInspectionComponent } from './add-departmental-inspection.component';

describe('AddDepartmentalInspectionComponent', () => {
  let component: AddDepartmentalInspectionComponent;
  let fixture: ComponentFixture<AddDepartmentalInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDepartmentalInspectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDepartmentalInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
