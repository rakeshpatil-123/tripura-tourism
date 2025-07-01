import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarMenu } from './side-bar-menu.component';

describe('SideBarMenu', () => {
  let component: SideBarMenu;
  let fixture: ComponentFixture<SideBarMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarMenu]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SideBarMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
