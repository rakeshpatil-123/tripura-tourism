import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveCalculatorComponent } from './incentive-calculator.component';

describe('IncentiveCalculatorComponent', () => {
  let component: IncentiveCalculatorComponent;
  let fixture: ComponentFixture<IncentiveCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
