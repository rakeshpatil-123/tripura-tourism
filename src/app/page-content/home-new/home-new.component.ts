import { Component } from '@angular/core';
import { HeaderNewComponent } from './header-new/header-new.component';
import { NewNavComponent } from './new-nav/new-nav.component';
import { NewNotificationComponent } from './new-notifcation/new-notification.component';
import { NewSliderComponent } from './new-slider/new-slider.component';
import { NewSuccessStorysComponent } from './new-success-storys/new-success-storys.component';
import { KeyFeatureForSuccessComponent } from './key-feature-for-success/key-feature-for-success.component';
import { NewFocusSectorComponent } from './new-focus-sector/new-focus-sector.component';
import { NewTimelineComponent } from './new-timeline/new-timeline.component';
import { NewQuickAccessToolsComponent } from './new-quick-access-tools/new-quick-access-tools.component';
import { NewPerformanceAnalyticsComponent } from './new-performance-analytics/new-performance-analytics.component';
import { LatestNewsUpdatesComponent } from './latest-news-updates/latest-news-updates.component';
import { UserExperienceSuccessStoriesComponent } from './user-experience-success-stories/user-experience-success-stories.component';
import { NewOneStopInformationHubComponent } from './new-one-stop-information-hub/new-one-stop-information-hub.component';

@Component({
  selector: 'app-home-new',
  standalone: true,
  imports: [
    HeaderNewComponent,
    NewNavComponent,
    NewNotificationComponent,
    NewSliderComponent,
    NewSuccessStorysComponent,
    KeyFeatureForSuccessComponent,
    NewFocusSectorComponent,
    NewTimelineComponent,
    NewQuickAccessToolsComponent,
    NewPerformanceAnalyticsComponent,
    LatestNewsUpdatesComponent,
    UserExperienceSuccessStoriesComponent,
    NewOneStopInformationHubComponent,
  ],
  templateUrl: './home-new.component.html',
  styleUrl: './home-new.component.scss',
})
export class HomeNewComponent {}
