import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryUseComponent } from './try-use.component';

describe('TryUseComponent', () => {
  let component: TryUseComponent;
  let fixture: ComponentFixture<TryUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TryUseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TryUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
