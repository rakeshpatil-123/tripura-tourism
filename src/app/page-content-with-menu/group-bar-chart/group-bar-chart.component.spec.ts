import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBarChartComponent } from './group-bar-chart.component';

describe('GroupBarChartComponent', () => {
  let component: GroupBarChartComponent;
  let fixture: ComponentFixture<GroupBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupBarChartComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GroupBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
