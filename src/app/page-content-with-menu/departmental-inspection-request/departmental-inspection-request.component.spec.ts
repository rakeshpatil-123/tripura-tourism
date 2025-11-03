import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentalInspectionRequestComponent } from './departmental-inspection-request.component';

describe('DepartmentalInspectionRequestComponent', () => {
  let component: DepartmentalInspectionRequestComponent;
  let fixture: ComponentFixture<DepartmentalInspectionRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentalInspectionRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentalInspectionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
