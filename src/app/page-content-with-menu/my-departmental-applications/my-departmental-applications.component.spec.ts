import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDepartmentalApplicationsComponent } from './my-departmental-applications.component';

describe('MyDepartmentalApplicationsComponent', () => {
  let component: MyDepartmentalApplicationsComponent;
  let fixture: ComponentFixture<MyDepartmentalApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDepartmentalApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDepartmentalApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
