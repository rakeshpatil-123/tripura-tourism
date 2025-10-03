import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProformaListComponent } from './proforma-list.component';

describe('ProformaListComponent', () => {
  let component: ProformaListComponent;
  let fixture: ComponentFixture<ProformaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProformaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProformaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
