import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowHistoryComponent } from './workflow-history.component';

describe('WorkflowHistoryComponent', () => {
  let component: WorkflowHistoryComponent;
  let fixture: ComponentFixture<WorkflowHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
