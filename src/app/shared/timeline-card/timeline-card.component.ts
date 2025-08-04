import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

interface TimelineEvent {
  title: string;

  subtitle?: string;
  description: string;
  points: string[];
}


@Component({
  selector: 'app-timeline-card',
  imports: [CommonModule],
  templateUrl: './timeline-card.component.html',
  styleUrls: ['./timeline-card.component.scss']
})
export class TimelineCardComponent implements OnInit {
  ngOnInit(): void {
  }


  @Input() event: TimelineEvent[] = [
    {
      title: 'Event Title',
      subtitle: 'Event Subtitle',
      description: 'This is a detailed description of the event This is another detailed description of a different event lorem ipsum dolor sit amet.',
      points: ['Point 1', 'Point 2', 'Point 3']
    },{
      title: 'Another Event',
      subtitle: 'Another Subtitle',
      description: 'This is another detailed description of a different event lorem ipsum dolor sit amet This is another detailed description of a different event lorem ipsum dolor sit amet.',
      points: ['Point A', 'Point B', 'Point C']
    },{
      title: 'Third Event',
      subtitle: 'Third Subtitle',
      description: 'This is a detailed description of the third event This is another detailed description of a different event lorem ipsum dolor sit amet.',
      points: ['Point X', 'Point Y', 'Point Z']
    }
  ];



 randomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 61) + 40;
  const lightness = Math.floor(Math.random() * 41) + 10;  

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


}
