import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { BodegaService } from '../../services/bodega.service';
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
  bodegaStock: number = 0;
  constructor(private userService: UserService,private toastr: ToastrService, private authService: AuthService, private router: Router,private bodegaService:BodegaService) {}

  ngOnInit() {
    this.loadUsers() 
    this.loadStock()
    if (!this.authService.isAuthorized()) {
      this.router.navigate(['/factura']); // Redirigir a una página de no autorizado
    }
  }
  loadStock(){
    this.bodegaService.getStockBodega().subscribe(
      (response: { stock: number }) => {
        this.bodegaStock = response.stock;
        console.log("Stock Bodega",this.stock);
      },
      (error) => {
        this.errorMessage = 'Error al cargar el stock de la bodega';
      }
    );
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
  getUserStockAndTransfer() {
    this.userService.getUserStock(this.selectedUserUid).subscribe(
      (response: any) => {
        const userStock = response.stock;
        if (userStock > 0) {
          this.errorMessage = `El usuario todavía tiene stock. No se puede transferir más stock hasta que lo termine.`;
          this.toastr.warning(this.errorMessage, 'Advertencia');
        } else {
          this.transferirLibros();
        }
      },
      (error) => {
        this.errorMessage = 'Error al obtener el stock del usuario';
        this.toastr.error(this.errorMessage, 'Error');
        console.error('Error al obtener el stock del usuario:', error);
      }
    );
  }

  transferirLibros() {
    if (this.selectedUserUid && this.stock > 0) {
      this.userService.transferirStock(this.selectedUserUid, this.stock).subscribe(
        (response) => {
          this.successMessage = 'Stock transferido con éxito';
          this.errorMessage = '';
          this.toastr.success(this.successMessage, 'Éxito');
          this.loadStock(); // Actualizar el stock de la bodega después de la transferencia
        },
        (error) => {
          this.errorMessage = error.error.message || 'Error al transferir el stock';
          this.successMessage = '';
          this.toastr.error(this.errorMessage, 'Error');
        }
      );
    } else {
      this.toastr.warning('Por favor, seleccione un usuario y una cantidad válida de stock', 'Advertencia');
    }
  }

  onTransferirLibros() {
    if (this.selectedUserUid) {
      this.getUserStockAndTransfer(); // Verificar el stock del usuario antes de transferir
    } else {
      this.errorMessage = 'Por favor, seleccione un usuario';
      this.toastr.error(this.errorMessage, 'Error');
    }
  }
}