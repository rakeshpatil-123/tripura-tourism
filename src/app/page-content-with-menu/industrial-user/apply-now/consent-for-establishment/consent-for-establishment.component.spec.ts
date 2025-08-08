import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentForEstablishmentComponent } from './consent-for-establishment.component';

describe('ConsentForEstablishmentComponent', () => {
  let component: ConsentForEstablishmentComponent;
  let fixture: ComponentFixture<ConsentForEstablishmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentForEstablishmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentForEstablishmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
