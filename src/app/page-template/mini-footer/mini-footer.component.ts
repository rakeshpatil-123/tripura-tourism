import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mini-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mini-footer.component.html',
  styleUrls: ['./mini-footer.component.scss']
})
export class MiniFooterComponent {}