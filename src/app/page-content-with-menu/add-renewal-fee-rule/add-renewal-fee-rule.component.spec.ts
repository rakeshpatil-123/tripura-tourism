import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRenewalFeeRuleComponent } from './add-renewal-fee-rule.component';

describe('AddRenewalFeeRuleComponent', () => {
  let component: AddRenewalFeeRuleComponent;
  let fixture: ComponentFixture<AddRenewalFeeRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRenewalFeeRuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRenewalFeeRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
