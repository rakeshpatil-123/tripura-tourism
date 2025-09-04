import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-service-fee-rule-dialog',
  imports: [MatIconModule],
  templateUrl: './service-fee-rule-dialog.component.html',
  styleUrl: './service-fee-rule-dialog.component.scss',
})
export class ServiceFeeRuleDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ServiceFeeRuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    console.log(this.data);
  }
  close() {
    this.dialogRef.close();
  }
}
