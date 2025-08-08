import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafComponent } from './caf.component';

describe('CafComponent', () => {
  let component: CafComponent;
  let fixture: ComponentFixture<CafComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
