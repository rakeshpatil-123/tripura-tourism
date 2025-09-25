import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpFloatingButtonComponent } from './help-floating-button.component';

describe('HelpFloatingButtonComponent', () => {
  let component: HelpFloatingButtonComponent;
  let fixture: ComponentFixture<HelpFloatingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpFloatingButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpFloatingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
