import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from "../models/api/api-response";
import { NewItemTypeIndustry } from '../models/new-item-type-industry/new-item-type-industry';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
/**
 * @description 查詢所有業種
 * @returns 所有業種資料
 */
export class NewItemTypeIndustryService {
  constructor(private httpClient: HttpClient) {}

  getNewItemTypeIndustryList$(): Observable<ApiResponse<NewItemTypeIndustry[]>>{
    return this.httpClient.get<ApiResponse<NewItemTypeIndustry[]>>(
      `http://10.20.30.34:8080/system/newItemType/`,
      )
    }
}
