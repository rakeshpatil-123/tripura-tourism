import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControlName } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BlockCopyPasteDirective } from '../../directives/block-copy-paste.directive';

@Component({
  selector: 'app-ilogi-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, BlockCopyPasteDirective],
  templateUrl: './ilogi-input.component.html',
  styleUrls: ['./ilogi-input.component.scss']
})
export class IlogiInputComponent implements OnInit {
  @Input() submitted = false;
  @Input() fieldLabel: string = '';
  @Input() hideLabel = false;
  @Input() fieldId: string = '';
  @Input() pipe: string = '';
  @Input() fieldExactVal: string | number | undefined;
  @Input() errorMessages: { [key: string]: string } = {};
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() mandatory = false;
  @Input() appBlockCopyPaste = false;
  @Input() readonly = false;
  @Input() maxlength: string | number = '255';
  @Input() rows: string = '2';
  @Input() formControlName: string = '';
  @Output() blur = new EventEmitter<Event>();

  @ViewChild(FormControlName) formControlDirective?: FormControlName;

  errorFieldId = '';
  isHovered = false;

  ngOnInit() {
    if (this.fieldId) {
      this.errorFieldId = `invalid-input-${this.fieldId}`;
    }
  }

  showErrorOnFieldHover() {
    this.isHovered = true;
  }

  hideErrorOnFieldHoverOut() {
    this.isHovered = false;
  }

  changeBlur(event: Event) {
    if (!this.readonly) {
      this.blur.emit(event);
    }
  }

  checkIsNan(value: any) {
    return isNaN(value);
  }
}