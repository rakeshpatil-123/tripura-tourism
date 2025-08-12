import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeDateComponent } from './prime-date.component';

describe('PrimeDateComponent', () => {
  let component: PrimeDateComponent;
  let fixture: ComponentFixture<PrimeDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeDateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimeDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
