import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentForOperationComponent } from './consent-for-operation.component';

describe('ConsentForOperationComponent', () => {
  let component: ConsentForOperationComponent;
  let fixture: ComponentFixture<ConsentForOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentForOperationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentForOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
