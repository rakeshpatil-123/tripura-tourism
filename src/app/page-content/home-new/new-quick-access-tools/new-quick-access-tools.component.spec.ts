import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewQuickAccessToolsComponent } from './new-quick-access-tools.component';

describe('NewQuickAccessToolsComponent', () => {
  let component: NewQuickAccessToolsComponent;
  let fixture: ComponentFixture<NewQuickAccessToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewQuickAccessToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewQuickAccessToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
