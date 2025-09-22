import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCertificateComponent } from './service-certificate.component';

describe('ServiceCertificateComponent', () => {
  let component: ServiceCertificateComponent;
  let fixture: ComponentFixture<ServiceCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
