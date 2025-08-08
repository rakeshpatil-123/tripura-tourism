import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtarnalApplicationTrackingComponent } from './extarnal-application-tracking.component';

describe('ExtarnalApplicationTrackingComponent', () => {
  let component: ExtarnalApplicationTrackingComponent;
  let fixture: ComponentFixture<ExtarnalApplicationTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtarnalApplicationTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtarnalApplicationTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
