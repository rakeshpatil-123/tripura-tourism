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
    // this.router.navigate(['/page/login']);
    window.location.href = this.getRedirectUrl('/page/login');
  }
  private getRedirectUrl(path: string): string {
    const { origin, pathname } = window.location;
    const basePath = pathname.startsWith('/new') ? '/new' : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${basePath}${normalized}`;
  }
  goBack() {
    this.location.back();
  }
}
