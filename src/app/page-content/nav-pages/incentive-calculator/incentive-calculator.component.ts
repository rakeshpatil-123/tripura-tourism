import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incentive-calculator',
  templateUrl: './incentive-calculator.component.html',
  styleUrls: ['./incentive-calculator.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule] // Add FormsModule here
})
export class IncentiveCalculatorComponent implements OnInit {

  investmentForm: FormGroup;

  tiipis_gst_reimbursement_sample_data1: number = 0;
  tiipis_gst_reimbursement_sample_data2: number = 0;
  tiipis_gst_reimbursement_sample_data3: number = 0;

  total_tiips_subsidy_count: number = 0;
  total_unnati_subsidy_count: number = 0;
  total_of_tiips_and_unnati: number = 0;
  total_invested_amount_in_crore: number = 0;

  capitalInvestment: number = 60;
  capitalInvestment_MaximumIncentive: number = 0.5;
  capitalInvestment_InvestedAmount: number = 0; // Changed from 'any' to 'number'
  capitalInvestment_TIIPS_SubsidyPercentage: String = "NA";
  capitalInvestment_TIIPS_SubsidyAmount: any = "NA";
  capitalInvestment_UNNATI_SubsidyPercentage: number = 50;
  capitalInvestment_UNNATI_SubsidyAmount: any = 0;

  powerSubsidy: number = 12;
  powerSubsidy_MaximumIncentive = 33.33;
  powerSubsidy_InvestedAmount: number = 0;
  powerSubsidy_TIIPS_SubsidyPercentage: number = 33;
  powerSubsidy_TIIPS_SubsidyAmount: number = 0;
  powerSubsidy_UNNATI_SubsidyPercentage: String = "NA";
  powerSubsidy_UNNATI_SubsidyAmount: String = "NA";

  gstReimbursement: number = 5;
  gstReimbursement_MaximumIncentive: number = 100;
  gstReimbursement_InvestedAmount: number = 0;
  gstReimbursement_TIIPS_SubsidyPercentage: String = "NA";
  gstReimbursement_TIIPS_SubsidyAmount: any = "NA";
  gstReimbursement_UNNATI_SubsidyPercentage: number = 100;
  gstReimbursement_UNNATI_SubsidyAmount: number = 0;

  loanInterestSubsidy: number = 50;
  loanInterestSubsidy_MaximumIncentive: number = 5;
  loanInterestSubsidy_InvestedAmount: number = 0;
  loanInterestSubsidy_TIIPS_SubsidyPercentage: number = 5;
  loanInterestSubsidy_TIIPS_SubsidyAmount: number = 0;
  loanInterestSubsidy_UNNATI_SubsidyPercentage: String = "NA";
  loanInterestSubsidy_UNNATI_SubsidyAmount: String = "NA";

  // Initialize these properties to avoid 'possibly undefined' errors
  total_invested_amount: number = 0;
  loan_amount: number = 0;
  sectorOfUnit: string | undefined;
  subsidyName: string = '0';

  onPowerSubsidyChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.powerSubsidy = Number(inputElement.value);
    console.log('power subsidy updated:', this.powerSubsidy);
  }

  ongstReimbursementChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.gstReimbursement = Number(inputElement.value);
    console.log('sgst reimburement:', this.gstReimbursement);
  }

  onloanInterestSubsidyChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.loanInterestSubsidy = Number(inputElement.value);
    console.log('sgst reimburement:', this.loanInterestSubsidy);
  }

  calculateSubsidy() {
    console.log('got a click on caclulate subsidy');
    const formValues = this.investmentForm.value;
    console.log(formValues);
    
    // Add null checks or use default values
    this.total_invested_amount = formValues.totalInvestedAmount || 0;
    this.loan_amount = formValues.loanAmount || 0;

    // Capital Investment part - now safe from undefined errors
    this.capitalInvestment_InvestedAmount = parseFloat(((this.total_invested_amount * this.capitalInvestment) / 100).toFixed(4));

    // When capital investment is less than 1 cr ... 40 % of capital investment
    if (this.capitalInvestment_InvestedAmount < 1.0) {
      this.capitalInvestment_TIIPS_SubsidyAmount = parseFloat(((40 / 100) * parseFloat(this.capitalInvestment_InvestedAmount.toString())).toFixed(4));
      this.capitalInvestment_UNNATI_SubsidyAmount = "NA";

      // Calculating GST Reimbursement for TIIPIS
      this.tiipis_gst_reimbursement_sample_data1 = this.capitalInvestment_InvestedAmount * 1.5;
      this.tiipis_gst_reimbursement_sample_data2 = 6.25;
      this.tiipis_gst_reimbursement_sample_data3 = Math.min(this.tiipis_gst_reimbursement_sample_data1, this.tiipis_gst_reimbursement_sample_data2);

      this.gstReimbursement_TIIPS_SubsidyAmount = parseFloat(((this.total_invested_amount * this.gstReimbursement) / 100).toFixed(4));
      this.gstReimbursement_InvestedAmount = parseFloat(((this.total_invested_amount * this.gstReimbursement) / 100).toFixed(4));

      if (this.gstReimbursement_InvestedAmount > this.tiipis_gst_reimbursement_sample_data3) {
        this.gstReimbursement_TIIPS_SubsidyAmount = this.tiipis_gst_reimbursement_sample_data3;
      }

    } else {
      this.capitalInvestment_TIIPS_SubsidyAmount = "NA";
      this.capitalInvestment_UNNATI_SubsidyAmount = 0;
      this.gstReimbursement_TIIPS_SubsidyAmount = "NA";
    }

    // When capital investment is more than 1cr ...
    if (this.capitalInvestment_UNNATI_SubsidyAmount !== "NA") {
      this.capitalInvestment_UNNATI_SubsidyAmount = parseFloat((this.capitalInvestment_InvestedAmount * this.capitalInvestment_MaximumIncentive).toFixed(4));

      if (this.capitalInvestment_UNNATI_SubsidyAmount > 7.5) {
        this.capitalInvestment_UNNATI_SubsidyAmount = 7.5;
      }
    }

    // Power Subsidy Part ...
    this.powerSubsidy_InvestedAmount = parseFloat(((this.total_invested_amount * this.powerSubsidy) / 100).toFixed(4));
    this.powerSubsidy_TIIPS_SubsidyAmount = parseFloat(((this.powerSubsidy_InvestedAmount * this.powerSubsidy_MaximumIncentive) / 100).toFixed(4));
    this.powerSubsidy_TIIPS_SubsidyAmount = this.powerSubsidy_TIIPS_SubsidyAmount * 5;

    if (this.powerSubsidy_TIIPS_SubsidyAmount > 3.0) {
      this.powerSubsidy_TIIPS_SubsidyAmount = 3.0;
    }

    this.gstReimbursement_InvestedAmount = parseFloat(((this.total_invested_amount * this.gstReimbursement) / 100).toFixed(4));
    console.log(this.gstReimbursement_InvestedAmount);
    this.gstReimbursement_UNNATI_SubsidyAmount = parseFloat(this.gstReimbursement_InvestedAmount.toFixed(4));

    this.loanInterestSubsidy = parseFloat(((this.loan_amount / this.total_invested_amount) * 100).toFixed(4));
    this.loanInterestSubsidy_InvestedAmount = parseFloat(((this.total_invested_amount * this.loanInterestSubsidy) / 100).toFixed(4));
    this.loanInterestSubsidy_TIIPS_SubsidyAmount = parseFloat(((this.loanInterestSubsidy_InvestedAmount * this.loanInterestSubsidy_TIIPS_SubsidyPercentage) / 100 * 5).toFixed(4));
    
    if (this.loanInterestSubsidy_TIIPS_SubsidyAmount > 0.6) {
      this.loanInterestSubsidy_TIIPS_SubsidyAmount = 0.6;
    }

    // Calculating the total subsidy for tiips and unnati:
    if (this.capitalInvestment_TIIPS_SubsidyAmount !== "NA") {
      this.total_tiips_subsidy_count = parseFloat(
        (this.capitalInvestment_TIIPS_SubsidyAmount + this.powerSubsidy_TIIPS_SubsidyAmount + this.gstReimbursement_TIIPS_SubsidyAmount + this.loanInterestSubsidy_TIIPS_SubsidyAmount).toFixed(4)
      );
    } else {
      this.total_tiips_subsidy_count = parseFloat(
        (this.powerSubsidy_TIIPS_SubsidyAmount + this.loanInterestSubsidy_TIIPS_SubsidyAmount).toFixed(4)
      );
    }

    if (this.gstReimbursement_TIIPS_SubsidyAmount > 0) {
      this.gstReimbursement_UNNATI_SubsidyAmount = 0
    }

    if (this.capitalInvestment_UNNATI_SubsidyAmount !== "NA") {
      this.total_unnati_subsidy_count = parseFloat(
        (this.capitalInvestment_UNNATI_SubsidyAmount + this.gstReimbursement_UNNATI_SubsidyAmount).toFixed(4)
      );
    } else {
      this.total_unnati_subsidy_count = parseFloat(Number(this.gstReimbursement_UNNATI_SubsidyAmount).toFixed(4));
    }

    this.total_of_tiips_and_unnati = parseFloat(
      (this.total_tiips_subsidy_count + this.total_unnati_subsidy_count).toFixed(4)
    );
  }

  constructor(private fb: FormBuilder) {
    this.investmentForm = this.fb.group({
      sectorOfUnit: ['', Validators.required],
      totalInvestedAmount: [null, [Validators.required, Validators.min(0)]],
      loanAmount: [null, [Validators.required, Validators.min(0)]]
    }, { validators: this.loanAmountValidator });
  }

  loanAmountValidator(group: FormGroup) {
    const totalInvestedAmount = group.get('totalInvestedAmount')?.value;
    const loanAmount = group.get('loanAmount')?.value;

    if (loanAmount && totalInvestedAmount && loanAmount > totalInvestedAmount) {
      return { loanAmountExceeds: true };
    }

    return null;
  }

  validateForm() {
    if (this.investmentForm.invalid) {
      Object.values(this.investmentForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    } else {
      this.calculateSubsidy();
    }
  }

  ngOnInit(): void { }

  total() {
  }

  resetLoanAmount() {
    console.log('Total Invested Amount changed, resetting Loan Amount');
    this.investmentForm.get('loanAmount')?.setValue(null);
  }

  onCapitalInvestmentChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.capitalInvestment = Number(inputElement.value);
    console.log('Investment subsidy updated:', this.capitalInvestment);
  }
}