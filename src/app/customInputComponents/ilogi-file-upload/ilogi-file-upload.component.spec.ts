import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlogiFileUploadComponent } from './ilogi-file-upload.component';

describe('IlogiFileUploadComponent', () => {
  let component: IlogiFileUploadComponent;
  let fixture: ComponentFixture<IlogiFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlogiFileUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IlogiFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
