import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-status',
  imports: [CommonModule],
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.scss',
})
export class PaymentStatusComponent {
  private route = inject(ActivatedRoute);

  status: string | null = null;
  orderId: string | null = null;
  amount: string | null = null;
  message: string | null = null;

  constructor(private router: Router,) { }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParamMap;

    this.status = queryParams.get('status');
    this.orderId = queryParams.get('order_id');
    this.amount = queryParams.get('amount');
    this.message = queryParams.get('message');

    // console.log({ status: this.status, order_id: this.orderId, amount: this.amount, message: this.message });
  }

  private getBasePath(): string {
    return this.router.url.startsWith('/onlineservice') ? '/onlineservice' : '';
  }

  goHome() {
    const basePath = this.getBasePath();
    this.router.navigate(
      [`${basePath}/dashboard/payments`])
  }
}
