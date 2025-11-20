import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserDashboardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  {
userType: string= ''

constructor(private genericService : GenericService){}
ngOnInit(){

  this.userType = this.genericService.decryptLocalStorageItem('user_type') || '';
  
}
 
}
