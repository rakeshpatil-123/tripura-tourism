import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
interface DonutData {
    label: string;
    value: number;
    color: string;

}
@Component({
    selector: 'app-donut-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss']

})
export class DonutChartComponent implements OnInit {
    @Input() title: string = 'Status Distribution';
    @Input() data: DonutData[] = [
      { label: 'Approved', value: 50, color: '#0d6efd' },
      { label: 'Pending', value: 30, color: '#ffc107' },
      { label: 'Rejected', value: 20, color: '#dc3545' }

  ]; 
  @Input() size: number = 200;
  segments: any[] = [];
  total: number = 0;
  hoveredItem: string | null = null;
  loading: boolean = true;

ngOnInit() {
    setTimeout(() => {
        this.calculateTotal();
        this.generateSegments();
        this.loading = false;
    }, 1000); 
}
  ngOnChanges() {
      this.calculateTotal();
      this.generateSegments();

  }
  private calculateTotal() {
      this.total = this.data.reduce((sum, item) => sum + item.value, 0);

  }
  private generateSegments() {
      if (this.total === 0) {
        this.segments = [];
        return;

    }
    const radius = this.size / 2 - 20;
    const innerRadius = radius * 0.6;
    let currentAngle = 0;
    this.segments = this.data.map(item => {
        const percentage = item.value / this.total;
        const angle = percentage * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        const x1 = Math.cos(startAngle) * radius;
        const y1 = Math.sin(startAngle) * radius;
        const x2 = Math.cos(endAngle) * radius;
        const y2 = Math.sin(endAngle) * radius;
        const x3 = Math.cos(endAngle) * innerRadius;
        const y3 = Math.sin(endAngle) * innerRadius;
        const x4 = Math.cos(startAngle) * innerRadius;
        const y4 = Math.sin(startAngle) * innerRadius;
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        const path = `
          M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;
      currentAngle += angle;
      return {
          path: path.trim(),
          color: item.color,
          label: item.label,
          value: item.value

      };
    });
  }
  getPercentage(value: number): number {
      if (this.total === 0) return 0;
      return Math.round((value / this.total) * 100);

  }
  onSegmentHover(segment: any) {
      this.hoveredItem = segment.label;

  }
  onSegmentLeave() {
      this.hoveredItem = null;

  }
  trackByIndex(index: number): number {
      return index;

  }
  trackByLabel(index: number, item: DonutData): string {
      return item.label;

  }
}