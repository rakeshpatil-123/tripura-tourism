import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewServiceFeeRuleComponent } from './view-service-fee-rule.component';

describe('ViewServiceFeeRuleComponent', () => {
  let component: ViewServiceFeeRuleComponent;
  let fixture: ComponentFixture<ViewServiceFeeRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewServiceFeeRuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewServiceFeeRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
