import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyFeatureForSuccessComponent } from './key-feature-for-success.component';

describe('KeyFeatureForSuccessComponent', () => {
  let component: KeyFeatureForSuccessComponent;
  let fixture: ComponentFixture<KeyFeatureForSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyFeatureForSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyFeatureForSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
