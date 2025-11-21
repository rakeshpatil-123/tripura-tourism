import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent {

  @Output() filtersChanged = new EventEmitter<any>();

  triggerEvents = ['All', 'At Registration', 'Post-OPD Visit', 'Post-Discharge'];
  feedbackForms = ['All', 'Language Test 1', 'Language Test', 'Registration Feedback Form', 'OPD Feedback Form', 'Post-Discharge Feedback Form'];
  durations = ['Last 7 Days', 'Last 30 Days', 'Year'];

  filters = {
    triggerEvent: 'All',
    feedbackForm: 'All',
    duration: 'Last 30 Days',
    startDate: '',
    endDate: ''
  };

  emitFilters() {
    this.filtersChanged.emit(this.filters);
  }
}
