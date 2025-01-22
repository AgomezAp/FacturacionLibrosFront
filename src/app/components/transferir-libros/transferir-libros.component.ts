import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-transferir-libros',
  imports: [NavbarComponent,CommonModule, FormsModule,],
  templateUrl: './transferir-libros.component.html',
  styleUrl: './transferir-libros.component.css'
})
export class TransferirLibrosComponent implements OnInit {
  users: User[] = [];
  selectedUserUid: string = '';
  stock: number = 0;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadUsers() 
    if (!this.authService.isAuthorized()) {
      this.router.navigate(['/factura']); // Redirigir a una página de no autorizado
    }
  }

  loadUsers() {
    this.userService.getUser().subscribe(
      (users) => {
        this.users = users;
        console.log(this.users);
      },
      (error) => {
        this.errorMessage = 'Error al cargar la lista de usuarios';
      }
    );
  }

  onTransferirLibros() {
    this.userService.transferirStock(this.selectedUserUid, this.stock).subscribe(
      (response) => {
        this.successMessage = 'Stock transferido con éxito';
        this.errorMessage = '';
      },
      (error) => {
        this.errorMessage = 'Error al transferir el stock';
        this.successMessage = '';
      }
    );
  }
}