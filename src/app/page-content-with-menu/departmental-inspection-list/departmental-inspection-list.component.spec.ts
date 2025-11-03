import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentalInspectionListComponent } from './departmental-inspection-list.component';

describe('DepartmentalInspectionListComponent', () => {
  let component: DepartmentalInspectionListComponent;
  let fixture: ComponentFixture<DepartmentalInspectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentalInspectionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentalInspectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
