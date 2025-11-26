import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarGraphDeptUserComponent } from './bar-graph-dept-user.component';

describe('BarGraphDeptUserComponent', () => {
  let component: BarGraphDeptUserComponent;
  let fixture: ComponentFixture<BarGraphDeptUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarGraphDeptUserComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BarGraphDeptUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
