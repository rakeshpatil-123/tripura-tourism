import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFocusSectorComponent } from './new-focus-sector.component';

describe('NewFocusSectorComponent', () => {
  let component: NewFocusSectorComponent;
  let fixture: ComponentFixture<NewFocusSectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFocusSectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFocusSectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
