import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlogiInputDateComponent } from './ilogi-input-date.component';

describe('IlogiInputDateComponent', () => {
  let component: IlogiInputDateComponent;
  let fixture: ComponentFixture<IlogiInputDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlogiInputDateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IlogiInputDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
