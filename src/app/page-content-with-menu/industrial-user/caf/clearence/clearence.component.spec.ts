import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearenceComponent } from './clearence.component';

describe('ClearenceComponent', () => {
  let component: ClearenceComponent;
  let fixture: ComponentFixture<ClearenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
