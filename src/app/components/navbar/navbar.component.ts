import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router:Router){}
  logOut(){
    localStorage.removeItem('token')
    localStorage.clear();
    this.router.navigate(['/logIn'])
  }
  verFactura() {
    this.router.navigate(['/factura']);
  }

  transferirStock() {
    this.router.navigate(['/tranferirLibros']);
  }


}

