import { Routes } from '@angular/router';

import {
  AccesDeniedComponent,
} from './components/acces-denied/acces-denied.component';
import { FacturaComponent } from './components/factura/factura.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import {
  ResetPasswordComponent,
} from './components/reset-password/reset-password.component';
import {
  TransferirLibrosComponent,
} from './components/transferir-libros/transferir-libros.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'logIn',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: RegisterComponent,
      },
      {
        path: 'reestablecerContraseña',
        component: ResetPasswordComponent,
      },
      {
        path:'factura',
        component: FacturaComponent
      },
      {
        path: 'access-denied', component: AccesDeniedComponent
      },
      {
        path: 'tranferirLibros',component:TransferirLibrosComponent
      }   
      
    
];
