import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveQuestionsComponent } from './incentive-questions.component';

describe('IncentiveQuestionsComponent', () => {
  let component: IncentiveQuestionsComponent;
  let fixture: ComponentFixture<IncentiveQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentiveQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentiveQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
