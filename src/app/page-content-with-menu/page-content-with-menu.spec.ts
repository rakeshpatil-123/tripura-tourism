import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageContentWithMenu } from './page-content-with-menu';

describe('PageContentWithMenu', () => {
  let component: PageContentWithMenu;
  let fixture: ComponentFixture<PageContentWithMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageContentWithMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageContentWithMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
