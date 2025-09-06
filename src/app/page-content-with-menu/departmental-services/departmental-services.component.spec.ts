import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentalServicesComponent } from './departmental-services.component';

describe('DepartmentalServicesComponent', () => {
  let component: DepartmentalServicesComponent;
  let fixture: ComponentFixture<DepartmentalServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentalServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentalServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
