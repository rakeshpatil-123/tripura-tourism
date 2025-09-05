import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalCycleComponent } from './renewal-cycle.component';

describe('RenewalCycleComponent', () => {
  let component: RenewalCycleComponent;
  let fixture: ComponentFixture<RenewalCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewalCycleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
