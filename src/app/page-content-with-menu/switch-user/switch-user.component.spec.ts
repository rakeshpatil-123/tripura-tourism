import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchUserComponent } from './switch-user.component';

describe('SwitchUserComponent', () => {
  let component: SwitchUserComponent;
  let fixture: ComponentFixture<SwitchUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwitchUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwitchUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
