import { NgModule } from '@angular/core';
import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {ProcessProductComponent} from '../search-option/process-product/process-product.component';

/**
 * @title Tab group animations
 */
@Component({
  selector: 'app-product-detail-layout',
  templateUrl: './product-detail-layout.html',
  styleUrls: ['./product-detail-layout.css'],
  standalone: true,
  imports: [MatTabsModule, ProcessProductComponent],
})
export class ProductDetailLayout {}
