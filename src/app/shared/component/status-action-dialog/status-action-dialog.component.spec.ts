import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusActionDialogComponent } from './status-action-dialog.component';

describe('StatusActionDialogComponent', () => {
  let component: StatusActionDialogComponent;
  let fixture: ComponentFixture<StatusActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusActionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
