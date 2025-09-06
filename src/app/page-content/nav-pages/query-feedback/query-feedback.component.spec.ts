import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryFeedbackComponent } from './query-feedback.component';

describe('QueryFeedbackComponent', () => {
  let component: QueryFeedbackComponent;
  let fixture: ComponentFixture<QueryFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
