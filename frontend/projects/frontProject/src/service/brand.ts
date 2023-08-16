import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/api/api-response';
import { BrandRes } from '../models/brand/brand-res';
@Injectable({
  providedIn: 'root'
})
export class BrandService {
  constructor(private httpClient: HttpClient) {}

  getBrandDetail$(): Observable<ApiResponse<BrandRes[]>>{
    return this.httpClient.get<ApiResponse<BrandRes[]>>(
      `http://10.20.30.34:8080/system/brands/`,
      )
    }
}
