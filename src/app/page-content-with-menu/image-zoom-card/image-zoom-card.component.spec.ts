import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageZoomCardComponent } from './image-zoom-card.component';

describe('ImageZoomCardComponent', () => {
  let component: ImageZoomCardComponent;
  let fixture: ComponentFixture<ImageZoomCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageZoomCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageZoomCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
