import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRenewalFeeRuleComponent } from './view-renewal-fee-rule.component';

describe('ViewRenewalFeeRuleComponent', () => {
  let component: ViewRenewalFeeRuleComponent;
  let fixture: ComponentFixture<ViewRenewalFeeRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRenewalFeeRuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRenewalFeeRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
