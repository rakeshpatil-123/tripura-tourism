import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackRatingComponent } from './feedback-rating.component';

describe('FeedbackRatingComponent', () => {
  let component: FeedbackRatingComponent;
  let fixture: ComponentFixture<FeedbackRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackRatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
