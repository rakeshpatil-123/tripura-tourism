import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveranceComponent } from './giverance.component';

describe('GiveranceComponent', () => {
  let component: GiveranceComponent;
  let fixture: ComponentFixture<GiveranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiveranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiveranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
