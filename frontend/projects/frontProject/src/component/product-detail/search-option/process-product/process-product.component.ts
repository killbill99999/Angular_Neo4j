import {MatExpansionModule} from '@angular/material/expansion';
import {Component, OnInit} from '@angular/core';
import {FormControl,FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';
import {NgFor, AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { NewItemReq } from 'projects/frontProject/src/models/new-item/new-item-req';
import {Service} from 'projects/frontProject/src/service/index';
import { HttpClient } from '@angular/common/http';
import { Brand } from 'projects/frontProject/src/models/brand/brand';
import {MatSelectModule} from '@angular/material/select';
import { NewItemTypeIndustry } from 'projects/frontProject/src/models/new-item-type-industry/new-item-type-industry';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

let brandList: string[] = [];

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

/**
 * @title Basic expansion panel
 */
@Component({
  selector: 'app-process-product',
  templateUrl: './process-product.component.html',
  styleUrls: ['./process-product.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    NgFor,
    AsyncPipe,
    MatCheckboxModule,
    JsonPipe,
    MatButtonModule,
    MatTableModule,
    MatSelectModule
  ],
})

export class ProcessProductComponent implements OnInit{
  panelOpenState = false;
  industryControl = new FormControl('');
  brandControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  industryOptions!: NewItemTypeIndustry[] | undefined;
  brandOptions!: Brand[] | undefined;
  allItemCategory : NewItemTypeIndustry[] =[
    {
      newItemTypeCode: "all",
      newItemTypeName: "全部",
    },
  ];
  searchData: NewItemReq = {};
  toppings = this._formBuilder.group({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });

  constructor(public http: HttpClient, private apiService: Service, private _formBuilder: FormBuilder) {}
  ngOnInit() {

    this.apiService.NewItemTypeIndustryService.getNewItemTypeIndustryList$().pipe(
      map(res => res.data),
      tap(data=>  this.industryOptions = data)
    ).subscribe()

    this.apiService.BrandService.getBrandDetail$().pipe(
      map(res => res.data),
      map(data => data?.map((x)=>x.brandCategoryDto[0]).filter((x)=>x)),
      tap(data=> this.brandOptions = data)
    ).subscribe()
  }

  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.options.filter(option => option.toLowerCase().includes(filterValue));
  // }

  // table data
  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  data: PeriodicElement[] = ELEMENT_DATA;

  addColumn() {
    const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
    this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }
}
