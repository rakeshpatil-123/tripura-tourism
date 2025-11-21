import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IlogiSelectComponent,
    IlogiInputDateComponent
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent {
  fromDate: any = '';
  toDate: any = '';
  selectedProduct: string = '';
  selectedRegion: string = '';
  products = [
    { name: 'Laptop', id: 'laptop' },
    { name: 'Mobile', id: 'mobile' },
    { name: 'Printer', id: 'printer' }
  ];

  regions = [
    { name: 'North', id: 'north' },
    { name: 'South', id: 'south' },
    { name: 'East', id: 'east' },
    { name: 'West', id: 'west' }
  ];
  salesList = [
    {
      product: 'Laptop',
      region: 'North',
      date: '12-02-2025',
      quantity: 25,
      amount: 35000
    },
    {
      product: 'Mobile',
      region: 'South',
      date: '14-02-2025',
      quantity: 40,
      amount: 20000
    },
    {
      product: 'Printer',
      region: 'East',
      date: '16-02-2025',
      quantity: 10,
      amount: 7000
    }
  ];

  filteredSales = [...this.salesList];
  search() {
    this.filteredSales = this.salesList.filter(item => {
      return (
        (!this.selectedProduct || item.product.toLowerCase() === this.selectedProduct.toLowerCase()) &&
        (!this.selectedRegion || item.region.toLowerCase() === this.selectedRegion.toLowerCase())
      );
    });
  }
  reset() {
    this.fromDate = '';
    this.toDate = '';
    this.selectedProduct = '';
    this.selectedRegion = '';

    this.filteredSales = [...this.salesList];
  }

  exportData() {
    alert('Export feature will be added soon!');
  }
}
