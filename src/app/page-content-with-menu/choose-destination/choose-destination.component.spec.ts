import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseDestinationComponent } from './choose-destination.component';

describe('ChooseDestinationComponent', () => {
  let component: ChooseDestinationComponent;
  let fixture: ComponentFixture<ChooseDestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseDestinationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
