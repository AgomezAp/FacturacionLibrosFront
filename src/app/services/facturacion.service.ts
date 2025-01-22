import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';
import { Facturacion } from '../interfaces/facturacion';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private appUrl : string;
  private apiUrl : string;
  constructor(private http:HttpClient) { 
     this.appUrl= environment.apiUrl
    this.apiUrl = 'api/venta'
  }
  getFactura():Observable<Facturacion[]>{
    return this.http.get<Facturacion[]>(`${this.appUrl}${this.apiUrl}/verVentas`)
  }
  
  registrarFactura(factura:Facturacion):Observable<Facturacion>{
    return this.http.post<Facturacion>(`${this.appUrl}${this.apiUrl}/vender`, factura)
  }

}
