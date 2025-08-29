import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceFeeRuleDialogComponent } from './service-fee-rule-dialog.component';

describe('ServiceFeeRuleDialogComponent', () => {
  let component: ServiceFeeRuleDialogComponent;
  let fixture: ComponentFixture<ServiceFeeRuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceFeeRuleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceFeeRuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
