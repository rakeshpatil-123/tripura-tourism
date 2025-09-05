import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApprovalFlowComponent } from './add-approval-flow.component';

describe('AddApprovalFlowComponent', () => {
  let component: AddApprovalFlowComponent;
  let fixture: ComponentFixture<AddApprovalFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddApprovalFlowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddApprovalFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
