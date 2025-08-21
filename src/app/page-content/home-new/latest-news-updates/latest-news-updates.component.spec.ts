import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestNewsUpdatesComponent } from './latest-news-updates.component';

describe('LatestNewsUpdatesComponent', () => {
  let component: LatestNewsUpdatesComponent;
  let fixture: ComponentFixture<LatestNewsUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestNewsUpdatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestNewsUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
