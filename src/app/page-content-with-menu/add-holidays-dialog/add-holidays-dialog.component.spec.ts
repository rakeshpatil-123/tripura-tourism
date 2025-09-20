import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHolidaysDialogComponent } from './add-holidays-dialog.component';

describe('AddHolidaysDialogComponent', () => {
  let component: AddHolidaysDialogComponent;
  let fixture: ComponentFixture<AddHolidaysDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHolidaysDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHolidaysDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
