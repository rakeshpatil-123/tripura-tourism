import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDateDialogComponent } from './confirm-date-dialog.component';

describe('ConfirmDateDialogComponent', () => {
  let component: ConfirmDateDialogComponent;
  let fixture: ComponentFixture<ConfirmDateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
