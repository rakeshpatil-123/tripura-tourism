import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralInspectionSystemComponent } from './central-inspection-system.component';

describe('CentralInspectionSystemComponent', () => {
  let component: CentralInspectionSystemComponent;
  let fixture: ComponentFixture<CentralInspectionSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralInspectionSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralInspectionSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
