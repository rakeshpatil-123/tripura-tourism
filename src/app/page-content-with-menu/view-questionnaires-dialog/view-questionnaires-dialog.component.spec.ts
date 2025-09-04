import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuestionnairesDialogComponent } from './view-questionnaires-dialog.component';

describe('ViewQuestionnairesDialogComponent', () => {
  let component: ViewQuestionnairesDialogComponent;
  let fixture: ComponentFixture<ViewQuestionnairesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuestionnairesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewQuestionnairesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
