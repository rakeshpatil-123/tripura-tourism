import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewThirdPartyParamsComponent } from './view-third-party-params.component';

describe('ViewThirdPartyParamsComponent', () => {
  let component: ViewThirdPartyParamsComponent;
  let fixture: ComponentFixture<ViewThirdPartyParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewThirdPartyParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewThirdPartyParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
