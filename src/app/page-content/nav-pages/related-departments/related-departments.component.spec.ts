import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedDepartmentsComponent } from './related-departments.component';

describe('RelatedDepartmentsComponent', () => {
  let component: RelatedDepartmentsComponent;
  let fixture: ComponentFixture<RelatedDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedDepartmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
