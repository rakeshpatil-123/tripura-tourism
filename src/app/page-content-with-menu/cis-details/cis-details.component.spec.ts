import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CisDetailsComponent } from './cis-details.component';

describe('CisDetailsComponent', () => {
  let component: CisDetailsComponent;
  let fixture: ComponentFixture<CisDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CisDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CisDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
