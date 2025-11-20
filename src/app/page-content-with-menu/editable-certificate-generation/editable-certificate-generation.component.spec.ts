import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableCertificateGenerationComponent } from './editable-certificate-generation.component';

describe('EditableCertificateGenerationComponent', () => {
  let component: EditableCertificateGenerationComponent;
  let fixture: ComponentFixture<EditableCertificateGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableCertificateGenerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableCertificateGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
