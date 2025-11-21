import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentUserListComponent } from './department-user-list.component';

describe('DepartmentUserListComponent', () => {
  let component: DepartmentUserListComponent;
  let fixture: ComponentFixture<DepartmentUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentUserListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
