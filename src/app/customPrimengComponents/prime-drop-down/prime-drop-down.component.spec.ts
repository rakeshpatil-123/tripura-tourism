import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeDropDownComponent } from './prime-drop-down.component';

describe('PrimeDropDownComponent', () => {
  let component: PrimeDropDownComponent;
  let fixture: ComponentFixture<PrimeDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeDropDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimeDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
