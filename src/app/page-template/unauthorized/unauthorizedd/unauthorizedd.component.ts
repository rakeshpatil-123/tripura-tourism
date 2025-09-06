import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-unauthorizedd',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './unauthorizedd.component.html',
  styleUrls: ['./unauthorizedd.component.scss']
})
export class UnauthorizeddComponent {
  constructor(private router: Router, private location: Location) { }
  goToLogin() {
    this.router.navigate(['/page/login']);
  }
  goBack() {
    this.location.back();
  }
}
