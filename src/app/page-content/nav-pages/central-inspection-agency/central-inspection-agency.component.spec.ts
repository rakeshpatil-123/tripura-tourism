import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralInspectionAgencyComponent } from './central-inspection-agency.component';

describe('CentralInspectionAgencyComponent', () => {
  let component: CentralInspectionAgencyComponent;
  let fixture: ComponentFixture<CentralInspectionAgencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralInspectionAgencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralInspectionAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
