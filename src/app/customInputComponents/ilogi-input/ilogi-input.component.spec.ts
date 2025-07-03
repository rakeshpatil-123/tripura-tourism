import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlogiInputComponent } from './ilogi-input.component';

describe('IlogiInputComponent', () => {
  let component: IlogiInputComponent;
  let fixture: ComponentFixture<IlogiInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlogiInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IlogiInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
