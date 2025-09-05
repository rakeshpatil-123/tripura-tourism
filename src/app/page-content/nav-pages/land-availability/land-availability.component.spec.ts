import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandAvailabilityComponent } from './land-availability.component';

describe('LandAvailabilityComponent', () => {
  let component: LandAvailabilityComponent;
  let fixture: ComponentFixture<LandAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
