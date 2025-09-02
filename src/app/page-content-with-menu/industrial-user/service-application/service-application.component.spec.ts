import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceApplicationComponent } from './service-application.component';

describe('ServiceApplicationComponent', () => {
  let component: ServiceApplicationComponent;
  let fixture: ComponentFixture<ServiceApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
