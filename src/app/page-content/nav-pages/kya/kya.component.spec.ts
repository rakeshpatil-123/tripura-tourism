import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KYAComponent } from './kya.component';

describe('KYAComponent', () => {
  let component: KYAComponent;
  let fixture: ComponentFixture<KYAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KYAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KYAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
