import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
 private appUrl: string;
  private apiUrl: string;
  constructor(private http: HttpClient) {
    this.appUrl = environment.apiUrl;
    this.apiUrl = 'api/bodega';
  }

    getStockBodega(): Observable<any> {
      return this.http.get(`${this.appUrl}${this.apiUrl}/verStockBodega`);
    }
}
