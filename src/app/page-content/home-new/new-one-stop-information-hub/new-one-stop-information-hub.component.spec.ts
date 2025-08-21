import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOneStopInformationHubComponent } from './new-one-stop-information-hub.component';

describe('NewOneStopInformationHubComponent', () => {
  let component: NewOneStopInformationHubComponent;
  let fixture: ComponentFixture<NewOneStopInformationHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOneStopInformationHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewOneStopInformationHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
