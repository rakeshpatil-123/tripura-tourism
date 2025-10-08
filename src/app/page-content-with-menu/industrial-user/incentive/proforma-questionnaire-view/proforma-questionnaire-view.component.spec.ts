import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProformaQuestionnaireViewComponent } from './proforma-questionnaire-view.component';

describe('ProformaQuestionnaireViewComponent', () => {
  let component: ProformaQuestionnaireViewComponent;
  let fixture: ComponentFixture<ProformaQuestionnaireViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProformaQuestionnaireViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProformaQuestionnaireViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
