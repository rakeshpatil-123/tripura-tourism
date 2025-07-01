import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimStatusTableComponent } from './claim-status-table.component';

describe('ClaimStatusTableComponent', () => {
  let component: ClaimStatusTableComponent;
  let fixture: ComponentFixture<ClaimStatusTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimStatusTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimStatusTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
