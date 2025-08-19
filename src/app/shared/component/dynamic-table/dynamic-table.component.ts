import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent {
  @Input() title1!: string;
  @Input() title2!: string;
  @Input() rows: { label: string; controlName: string; type?: string; readonly?: boolean }[] = [];
  @Input() formGroup!: FormGroup;
}
