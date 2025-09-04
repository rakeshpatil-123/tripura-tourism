import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizeddComponent } from './unauthorizedd.component';

describe('UnauthorizeddComponent', () => {
  let component: UnauthorizeddComponent;
  let fixture: ComponentFixture<UnauthorizeddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizeddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizeddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
