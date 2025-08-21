import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPerformanceAnalyticsComponent } from './new-performance-analytics.component';

describe('NewPerformanceAnalyticsComponent', () => {
  let component: NewPerformanceAnalyticsComponent;
  let fixture: ComponentFixture<NewPerformanceAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPerformanceAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPerformanceAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
