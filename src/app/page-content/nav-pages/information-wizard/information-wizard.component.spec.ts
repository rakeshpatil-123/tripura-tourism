import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationWizardComponent } from './information-wizard.component';

describe('InformationWizardComponent', () => {
  let component: InformationWizardComponent;
  let fixture: ComponentFixture<InformationWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
