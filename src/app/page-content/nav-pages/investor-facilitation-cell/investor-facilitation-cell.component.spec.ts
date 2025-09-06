import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorFacilitationCellComponent } from './investor-facilitation-cell.component';

describe('InvestorFacilitationCellComponent', () => {
  let component: InvestorFacilitationCellComponent;
  let fixture: ComponentFixture<InvestorFacilitationCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorFacilitationCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorFacilitationCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
