import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisReportsComponent } from './mis-reports.component';

describe('MisReportsComponent', () => {
  let component: MisReportsComponent;
  let fixture: ComponentFixture<MisReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
