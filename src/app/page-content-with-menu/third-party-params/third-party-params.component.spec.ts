import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyParamsComponent } from './third-party-params.component';

describe('ThirdPartyParamsComponent', () => {
  let component: ThirdPartyParamsComponent;
  let fixture: ComponentFixture<ThirdPartyParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdPartyParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartyParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
