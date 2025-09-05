import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentalUsersComponent } from './departmental-users.component';

describe('DepartmentalUsersComponent', () => {
  let component: DepartmentalUsersComponent;
  let fixture: ComponentFixture<DepartmentalUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentalUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentalUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
