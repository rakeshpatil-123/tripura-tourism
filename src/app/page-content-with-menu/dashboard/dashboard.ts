import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';


interface ChartData {
  label: string;
  approved: number;
  rejected: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {

  @Input() title: string = 'Application Status (Count)';
  @Input() data: ChartData[] = [];

  yAxisTicks: number[] = [];
  maxValue: number = 0;

  ngOnInit() {
    this.calculateMaxValue();
    this.generateYAxisTicks();
  }

  ngOnChanges() {

    this.calculateMaxValue();
    this.generateYAxisTicks();
  }

  private calculateMaxValue() {
    const allValues = this.data.flatMap(item => [item.approved, item.rejected]);
    this.maxValue = Math.max(...allValues, 5);
  }

  private generateYAxisTicks() {
    const tickCount = 6;
    const maxVal = Math.ceil(this.maxValue / 0.5) * 0.5;
    const step = maxVal / (tickCount - 1);
    this.yAxisTicks = Array.from({ length: tickCount }, (_, i) =>
      parseFloat((i * step).toFixed(1))
    );
  }

  getBarHeight(value: number): number {
    if (this.maxValue === 0) return 0;
    return (value / this.maxValue) * 100;
  }

}



