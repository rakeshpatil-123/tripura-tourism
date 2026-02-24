import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarqueeCardsComponent } from './marquee-cards.component';

describe('MarqueeCardsComponent', () => {
  let component: MarqueeCardsComponent;
  let fixture: ComponentFixture<MarqueeCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqueeCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarqueeCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
