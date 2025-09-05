import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfServicesComponent } from './list-of-services.component';

describe('ListOfServicesComponent', () => {
  let component: ListOfServicesComponent;
  let fixture: ComponentFixture<ListOfServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
