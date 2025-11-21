import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CisSummaryComponent } from './cis-summary.component';

describe('CisSummaryComponent', () => {
  let component: CisSummaryComponent;
  let fixture: ComponentFixture<CisSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CisSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CisSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
