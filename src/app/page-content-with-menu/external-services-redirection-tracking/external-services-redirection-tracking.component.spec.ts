import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalServicesRedirectionTrackingComponent } from './external-services-redirection-tracking.component';

describe('ExternalServicesRedirectionTrackingComponent', () => {
  let component: ExternalServicesRedirectionTrackingComponent;
  let fixture: ComponentFixture<ExternalServicesRedirectionTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalServicesRedirectionTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalServicesRedirectionTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
