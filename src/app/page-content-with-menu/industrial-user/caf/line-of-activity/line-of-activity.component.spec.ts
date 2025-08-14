import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineOfActivityComponent } from './line-of-activity.component';

describe('LineOfActivityComponent', () => {
  let component: LineOfActivityComponent;
  let fixture: ComponentFixture<LineOfActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineOfActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineOfActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
