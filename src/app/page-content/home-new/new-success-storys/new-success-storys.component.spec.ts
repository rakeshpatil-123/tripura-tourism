import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSuccessStorysComponent } from './new-success-storys.component';

describe('NewSuccessStorysComponent', () => {
  let component: NewSuccessStorysComponent;
  let fixture: ComponentFixture<NewSuccessStorysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSuccessStorysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSuccessStorysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
