import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExperienceSuccessStoriesComponent } from './user-experience-success-stories.component';

describe('UserExperienceSuccessStoriesComponent', () => {
  let component: UserExperienceSuccessStoriesComponent;
  let fixture: ComponentFixture<UserExperienceSuccessStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserExperienceSuccessStoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserExperienceSuccessStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
