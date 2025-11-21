import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentalUserDashboardComponent } from './departmental-user-dashboard.component';

describe('DepartmentalUserDashboardComponent', () => {
  let component: DepartmentalUserDashboardComponent;
  let fixture: ComponentFixture<DepartmentalUserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentalUserDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentalUserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
