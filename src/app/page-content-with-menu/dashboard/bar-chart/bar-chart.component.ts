import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  label: string;
  approved: number;
  rejected: number;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input() title: string = 'Application Status (Count)';
  @Input() data: ChartData[] = [];

  yAxisTicks: number[] = [];
  maxValue: number = 0;

  ngOnInit() {
    this.calculateAndGenerateTicks();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.calculateAndGenerateTicks();
    }
  }

  private calculateAndGenerateTicks() {
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

  /*
   * Calculates the height of a bar as a percentage of the chart's total height.
   * @param value The value for the bar.
   * @returns The height of the bar in percentage.
   */
  getBarHeight(value: number): number {
    if (this.maxValue === 0) return 0; 
    return (value / this.maxValue) * 100;
  }
}