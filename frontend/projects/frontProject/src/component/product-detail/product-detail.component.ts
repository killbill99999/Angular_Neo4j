import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import NeoVis, { NeovisConfig, NonFlatNeovisConfig } from "neovis.js";
import {MatInputModule} from '@angular/material/input';
import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import { ThemePalette } from '@angular/material/core';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

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
 * @title Table dynamically changing the columns displayed
 */
@Component({
  selector: 'app-product-detail',
  styleUrls: ['./product-detail.component.css'],
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatTableModule, MatIconModule, NgFor, FormsModule, NgxMatColorPickerModule],
  providers: [
    { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
   ],
})

export class ProductDetailComponent {
  hide = true;
  picker: string = '';
  listColors = ['primary', 'accent', 'warn'];
   disabled = false;
   color: ThemePalette = 'primary';
   touchUi = false;
   mainColor: any = '';
   colorCtr: any = '';
   lineColor: any = '';

  cypherText: string = '';
  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  data: PeriodicElement[] = ELEMENT_DATA;

  valueChanged(newValue: string) {
    this.cypherText = newValue;
  }

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

  draw() {
console.log(this.colorCtr.hex)
    var config : NeovisConfig = {
      containerId: "viz",
      neo4j: {
          serverUrl: "bolt://10.20.30.34:7687",
          serverUser: "neo4j",
          serverPassword: "password"
      },
      labels: {
          DB: {
              label: "name",
              value: "pagerank",
              group: "community",
              font: {
                size: '15',
                color: `#${this.mainColor.hex}`
              }
          },
          Tool: {
            label: "name",
            value: "pagerank",
            group: "community",
            font: {
              size: '12',
              color: `#${this.mainColor.hex}`
            }
          },
          Person: {
            label: "name",
            value: "pagerank",
            group: "community",
            font: {
              size: '12',
              color: `#${this.mainColor.hex}`
            }
          },
          Movie: {
            label: "name",
            value: "pagerank",
            group: "community",
            font: {
              size: '12',
              color: `#${this.mainColor.hex}`
            }
          }
      },
      relationships: {
        ACTED_IN: {
          [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
              static: {
                  label: "ACTED_IN",
                  color: `#${this.lineColor.hex}`,
                  font: {
                      "background": "none",
                      "strokeWidth": "0",
                      "size": 12,
                      "color": `#${this.colorCtr.hex}`
                  }
              }
          }
      },
      CONTAINS: {
          [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
              static: {
                  label: "CONTAINS",
                  color: `#${this.lineColor.hex}`,
                  font: {
                      "background": "none",
                      "strokeWidth": "0",
                      "size": 12,
                      "color": `#${this.colorCtr.hex}`
                  }
              }
          }
      }
      },

      initialCypher: this.cypherText || "MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25"
 }
    var viz = new NeoVis(config);
    viz.render();
}
}
