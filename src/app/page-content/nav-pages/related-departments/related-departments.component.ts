import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-related-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './related-departments.component.html',
  styleUrls: ['./related-departments.component.scss']
})
export class RelatedDepartmentsComponent implements OnInit {
  departments: any[] = [];

  ngOnInit(): void {
    this.departments = [
      {
        name: 'Factories & Boilers Organization',
        address: 'Pandit Nehru Complex (Gorkhabasti), PO Kunjaban, Agartala, Tripura 799006',
        emails: ['cfbo.tripura@yahoo.in'],
        website: 'http://factory.tripura.gov.in',
        phone: '0381 225 4295'
      },
      {
        name: 'Land Records & Settlement',
        address: 'Behind Ujjayanta Palace, Agartala West, Tripura - 799001',
        emails: ['dlr.tripura@yahoo.in'],
        website: 'http://lrs.tripura.gov.in',
        phone: '0381 340643'
      },
      {
        name: 'Chief Electrical Inspector to Government (CEIG)',
        address: 'Pandit Nehru Complex (Gorkhabasti), PO Kunjaban, Agartala, Tripura 799006',
        emails: ['electricalinspectortripura@yahoo.in'],
        website: 'http://ped.tripura.gov.in/ped/index.php/citizen/electrical',
        phone: '0381 232324'
      },
      {
        name: 'Commercial Tax & Excise Department',
        address: 'Office of the Commissioner of Taxes & Excise, 3rd Floor, Khadya Bhawan, P N Complex, Gorkhabasti, Agartala Tripura West, 799006',
        emails: ['ct-tax.tripura.gov.in', 'excise-tripura.gov.in'],
        website: 'https://taxes.tripura.gov.in',
        phone: '0381 2325964'
      },
      {
        name: 'Co-Operative Registrar',
        address: 'Palace Compound, Indranagar, Ratamati Sarani, Agartala, Tripura 799001',
        emails: ['registrar2013@gmail.com', 'regcoops@gmail.com'],
        website: 'https://cooperation.tripura.gov.in/',
        phone: '0381 232 5765'
      },
      {
        name: 'Law Department',
        address: 'Law & Parliamentary Affairs Department, 1st Floor, Room No. 116/5, Secretariat Building, Khajur Bagan, Airport Road, Agartala, Pin: 799006',
        emails: ['lawdepartment@yahoo.com'],
        website: 'https://law.tripura.gov.in/',
        phone: '0381 241 6027/6027'
      },
      {
        name: 'Urban Development',
        address: 'Government of Tripura, Directorate of Urban Development, 6th Floor of U.D. Bhawan, Sakuntala Road, Near Rabindra Bhawan, Agartala - Tripura(W)',
        emails: ['directorbud.tripura@gmail.com'],
        website: 'https://udd.tripura.gov.in/',
        phone: '0381 241 8038/8077'
      },
      {
        name: 'Labour Department',
        address: 'Jackson Gate Building, Ground Floor, Lenin Sarani, Agartala - Kunjaban Rd, Dhaleswar, Agartala, Tripura 799001',
        emails: ['lc.lc.tripura.gov.in', 'tripura.lc@gmail.com'],
        website: 'https://labour.tripura.gov.in/',
        phone: '0381 232 1361'
      },
      {
        name: 'Health Department (Drug Controller)',
        address: 'Pandit Nehru Complex (Gorkhabasti), PO Kunjaban, Agartala, Tripura 799007',
        emails: ['drugcontrollertripura@gmail.com'],
        website: 'https://health.tripura.gov.in/drugregulation',
        phone: '0381 2325866'
      },
      {
        name: 'Tripura Forest Department',
        address: 'Pandit Nehru Complex (Gorkhabasti), PO Kunjaban, Agartala, Tripura 799006',
        emails: ['dcffhqt.tripura.gov.in'],
        website: 'https://forest.tripura.gov.in/',
        phone: '0381 2320764'
      },
      {
        name: 'Tripura Industrial Development Corporation Ltd.',
        address: 'Khejurbagan, Agartala, Tripura 799006',
        emails: ['tidcfmd@gmail.com'],
        website: 'https://tidc.tripura.in/',
        phone: '0381 2348671, 234646, 234673'
      },
      {
        name: 'Drinking Water and Sanitation (PWD)',
        address: 'Drinking Water & Sanitation Bhawan, P. N. Complex, Gorkhabasti, Agartala, Tripura 799006',
        emails: ['acewdpwd@gmail.com'],
        website: 'http://www.dwstripura.in/',
        phone: '0381 232 645'
      },
      {
        name: 'Tripura State Electricity Corporation Limited',
        address: 'Bhubaneswar Maidanpat, Indranagar, Agartala, Tripura 799001',
        emails: ['ceo.tsedcl@gmail.com'],
        website: 'https://www.tsecl.in/',
        phone: '0381 2318001 / 2319472'
      },
      {
        name: 'Tripura Pollution Control Board',
        address: 'Parivesh Bhawan, Gorkhabasti, Agartala, Tripura 799006',
        emails: ['tripuraspcb@gmail.com'],
        website: 'http://trpenvis.nic.in/',
        phone: '(0381)- 232 2455/232 2462/232 8792'
      },
      {
        name: 'Legal Metrology Department',
        address: 'Gorkhabasti, PO Kunjaban, Agartala, Tripura 799006',
        emails: ['clm.tripura@gmail.com'],
        website: 'http://lcm.tripura.gov.in/legal-metrology',
        phone: '0381 2329997'
      },
      {
        name: 'Industries & Commerce',
        address: 'Khejurbagan, Agartala, Tripura 799006',
        emails: ['industries.tripura@gmail.com'],
        website: 'https://industries.tripura.gov.in/',
        phone: '0381 234-8021'
      },
      {
        name: 'Fire',
        address: 'Directorate of Fire Service, Fire Brigade Chowmuhani, Agartala, Tripura - 799001',
        emails: ['tripurafireservice@gmail.com'],
        website: 'https://fireservice.tripura.gov.in/',
        phone: '0381 232-6481'
      }
    ];
    console.log('Departments data:', this.departments); // Debugging log
  }
}