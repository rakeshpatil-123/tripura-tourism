import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActsRulesComponent } from './acts-rules.component';

describe('ActsRulesComponent', () => {
  let component: ActsRulesComponent;
  let fixture: ComponentFixture<ActsRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActsRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActsRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
