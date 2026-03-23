import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripuraTourismLicensingComponent } from './tripura-tourism-licensing.component';

describe('TripuraTourismLicensingComponent', () => {
  let component: TripuraTourismLicensingComponent;
  let fixture: ComponentFixture<TripuraTourismLicensingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripuraTourismLicensingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripuraTourismLicensingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
