import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodIssueStatusComponent } from './nod-issue-status.component';

describe('NodIssueStatusComponent', () => {
  let component: NodIssueStatusComponent;
  let fixture: ComponentFixture<NodIssueStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodIssueStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodIssueStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
