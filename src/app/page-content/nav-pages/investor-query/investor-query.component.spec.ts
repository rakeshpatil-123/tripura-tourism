import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorQueryComponent } from './investor-query.component';

describe('InvestorQueryComponent', () => {
  let component: InvestorQueryComponent;
  let fixture: ComponentFixture<InvestorQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
