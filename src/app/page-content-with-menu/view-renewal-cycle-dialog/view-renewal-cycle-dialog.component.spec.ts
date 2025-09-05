import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRenewalCycleDialogComponent } from './view-renewal-cycle-dialog.component';

describe('ViewRenewalCycleDialogComponent', () => {
  let component: ViewRenewalCycleDialogComponent;
  let fixture: ComponentFixture<ViewRenewalCycleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRenewalCycleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRenewalCycleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
