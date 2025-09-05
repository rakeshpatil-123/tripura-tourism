import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewApprovalFlowDialogComponent } from './view-approval-flow-dialog.component';

describe('ViewApprovalFlowDialogComponent', () => {
  let component: ViewApprovalFlowDialogComponent;
  let fixture: ComponentFixture<ViewApprovalFlowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewApprovalFlowDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewApprovalFlowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
