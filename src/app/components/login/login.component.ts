import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';
import { ErrorsService } from '../../services/errors.service';
import { UserService } from '../../services/user.service';
import {
  SpinnerComponent,
} from '../../shared/spinner/spinner/spinner.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule,SpinnerComponent,FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  correo: string = ''
  contrasena: string = ''
  loading: boolean = false


  constructor(private userService: UserService,private authService: AuthService,private toastr: ToastrService,private router:Router,private errorService:ErrorsService) { }


  logIn() {
    if (this.correo === '' || this.contrasena === '') {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return;
    }

    const user = { correo: this.correo, contrasena: this.contrasena };
    this.loading = true;

    this.userService.logIn(user).subscribe({
      next: (response: any) => {
        const token = response.token;
        const Uid = response.Uid;
        this.loading = false;
        this.toastr.success('', 'Bienvenido');
        localStorage.setItem('token', token);
        localStorage.setItem('Uid', Uid); 
        this.authService.setUserEmail(this.correo);
        console.log(response.Uid);
        this.router.navigate(['/factura']);
      },
      error: (e: HttpErrorResponse) => {
        this.loading = false;
        this.errorService.messageError(e);
      }
    });
  }
}
