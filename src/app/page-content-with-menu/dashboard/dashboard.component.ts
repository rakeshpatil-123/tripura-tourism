import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { GenericService } from '../../_service/generic/generic.service';
import { DepartmentalUserDashboardComponent } from "../departmental-user-dashboard/departmental-user-dashboard.component";
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserDashboardComponent,
    DepartmentalUserDashboardComponent,
    AdminDashboardComponent,
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
 userRole: any;
 constructor(){}
 ngOnInit(): void {
   this.userRole = localStorage.getItem('userRole');
 }
}
