import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripuraNocDashboardComponent } from './tripura-noc-dashboard.component';

describe('TripuraNocDashboardComponent', () => {
  let component: TripuraNocDashboardComponent;
  let fixture: ComponentFixture<TripuraNocDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripuraNocDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripuraNocDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
