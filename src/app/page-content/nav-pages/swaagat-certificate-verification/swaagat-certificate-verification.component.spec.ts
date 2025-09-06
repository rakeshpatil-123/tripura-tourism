import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaagatCertificateVerificationComponent } from './swaagat-certificate-verification.component';

describe('SwaagatCertificateVerificationComponent', () => {
  let component: SwaagatCertificateVerificationComponent;
  let fixture: ComponentFixture<SwaagatCertificateVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwaagatCertificateVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwaagatCertificateVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
