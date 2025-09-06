import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoFooterComponent } from './logo-footer.component';

describe('LogoFooterComponent', () => {
  let component: LogoFooterComponent;
  let fixture: ComponentFixture<LogoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
