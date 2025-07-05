import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlogiRadioComponent } from './ilogi-radio.component';

describe('IlogiRadioComponent', () => {
  let component: IlogiRadioComponent;
  let fixture: ComponentFixture<IlogiRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlogiRadioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IlogiRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
