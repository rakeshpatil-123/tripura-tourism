import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionPreviewDialogComponent } from './question-preview-dialog.component';

describe('QuestionPreviewDialogComponent', () => {
  let component: QuestionPreviewDialogComponent;
  let fixture: ComponentFixture<QuestionPreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionPreviewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
