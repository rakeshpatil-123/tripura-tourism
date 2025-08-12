import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeInputComponent } from './prime-input.component';

describe('PrimeInputComponent', () => {
  let component: PrimeInputComponent;
  let fixture: ComponentFixture<PrimeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
