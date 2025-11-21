import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourRegisterComponent } from './labour-register.component';

describe('LabourRegisterComponent', () => {
  let component: LabourRegisterComponent;
  let fixture: ComponentFixture<LabourRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabourRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
