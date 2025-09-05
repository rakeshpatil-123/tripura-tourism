import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandAvailabilityGisComponent } from './land-availability-gis.component';

describe('LandAvailabilityGisComponent', () => {
  let component: LandAvailabilityGisComponent;
  let fixture: ComponentFixture<LandAvailabilityGisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandAvailabilityGisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandAvailabilityGisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
