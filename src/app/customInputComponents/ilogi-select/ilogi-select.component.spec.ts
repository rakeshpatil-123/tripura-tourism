import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlogiSelectComponent } from './ilogi-select.component';

describe('IlogiSelectComponent', () => {
  let component: IlogiSelectComponent;
  let fixture: ComponentFixture<IlogiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlogiSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IlogiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
