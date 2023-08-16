
import { Injectable } from '@angular/core';
import {BrandService} from "./brand";
import {NewItemTypeIndustryService} from "./new-item-type-industry-service";
@Injectable({
  providedIn: 'root'
})
// 在構造函数中可以同时使用
export class Service {
  constructor(
    public BrandService: BrandService,
    public NewItemTypeIndustryService: NewItemTypeIndustryService
    ) {}
}
