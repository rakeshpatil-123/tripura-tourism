import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlogiCheckboxComponent } from './ilogi-checkbox.component';

describe('IlogiCheckboxComponent', () => {
  let component: IlogiCheckboxComponent;
  let fixture: ComponentFixture<IlogiCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlogiCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IlogiCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
