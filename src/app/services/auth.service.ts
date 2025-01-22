import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authorizedEmails: string[] = ['agomez.desarrollo@andrespublicidadtg.com']; // Correos electrónicos autorizados

  constructor() {}

  isAuthorized(): boolean {
    const email = localStorage.getItem('correo');
    // Verificar si el correo electrónico está en la lista de autorizados
    return email ? this.authorizedEmails.includes(email) : false;
  }
  setUserId(userId: string): void {
    localStorage.setItem('Uid', userId);
  }

  getUserId(): string | null {
    return localStorage.getItem('Uid');
  }

  clearUserId(): void {
    localStorage.removeItem('Uid');
  }
  
  setUserEmail(email: string): void {
    localStorage.setItem('correo', email);
  }

  getUserEmail(): string | null {
    return localStorage.getItem('correo');
  }

  clearUserEmail(): void {
    localStorage.removeItem('correo');
  }
}
