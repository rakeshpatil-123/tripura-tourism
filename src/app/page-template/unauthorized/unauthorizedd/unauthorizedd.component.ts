import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorizedd',
  standalone: true, 
  imports: [RouterModule],
  templateUrl: './unauthorizedd.component.html',
  styleUrl: './unauthorizedd.component.scss'
})
export class UnauthorizeddComponent {
  constructor(private router: Router) {}
  goToLogin() {
  this.router.navigate(['/page/login']);
}
}
