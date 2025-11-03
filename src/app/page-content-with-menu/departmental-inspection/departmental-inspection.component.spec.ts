import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentalInspectionComponent } from './departmental-inspection.component';

describe('DepartmentalInspectionComponent', () => {
  let component: DepartmentalInspectionComponent;
  let fixture: ComponentFixture<DepartmentalInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentalInspectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentalInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
