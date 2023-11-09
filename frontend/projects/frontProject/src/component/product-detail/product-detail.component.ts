import {Component, AfterViewInit} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import NeoVis, { NeovisConfig } from "neovis.js";
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSliderModule} from '@angular/material/slider';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import { ThemePalette } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import * as neo4j from 'neo4j-driver';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

interface Food {
  value: string;
  viewValue: string;
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
  imports: [MatButtonModule, MatInputModule, MatTableModule, MatIconModule, NgFor, FormsModule, NgxMatColorPickerModule, MatSelectModule, MatFormFieldModule, MatSliderModule],
  providers: [
    { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
   ],
})
export class ProductDetailComponent implements AfterViewInit{

  ngAfterViewInit() {
    this.getNodeNames();
  };

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

 driver = neo4j.driver('bolt://10.20.30.34:7687', neo4j.auth.basic('neo4j', 'password'));
 session = this.driver.session();

//  模擬API回傳值
 async getNodeNames() {
  try {
    const result = await this.session.run('MATCH (n) RETURN distinct labels(n), count(*)');
    const nodeNames = result.records.map((record: any) => record._fields[0][0]);
    console.log(nodeNames);
  } catch (error) {
    console.error('Error executing Neo4j query:', error);
  } finally {
    await this.session.close();
    await this.driver.close();
  }
}

//


  barColor: ThemePalette = 'primary';
  lengthValue = 500;
  maxValue = 1000;

  limitCount: number = 10;
  nodeSize: number = 100;
  selectedValue: string = "All";
  selectedSubValue: string = "All";
  selectedTypeValue: string = "All";
  foods: Food[] = [
    {value: 'All', viewValue: '全部'},
    {value: 'Person', viewValue: '演員'},
  ];

  subCategory: Food[] = [
    {value: 'All', viewValue: '全部'},
    {value: 'Movie', viewValue: '電影'},
  ];

  typeList: Food[] = [
    {value: 'All', viewValue: '全部'},
    {value: 'DIRECTED', viewValue: '指導'},
    {value: 'WROTE', viewValue: '編寫'},
    {value: 'ACTED_IN', viewValue: '演出'},
  ];

  selectedNodeData:string[] = [];

  get computedLimitCount(): string {
    // 在这里计算属性的值，例如，将 originalValue 加倍
    return this.limitCount !== 0 ? ` LIMIT ${this.limitCount}`: '';
  }

  get computedValue(): string {
    // 在这里计算属性的值，例如，将 originalValue 加倍
    return this.selectedValue !== 'All' ? `:${this.selectedValue}`: '';
  }

  get computedSubValue(): string {
    // 在这里计算属性的值，例如，将 originalValue 加倍
    return this.selectedSubValue !== 'All' ? `:${this.selectedSubValue}`: '';
  }

  get computedTypeValue(): string {
    // 在这里计算属性的值，例如，将 originalValue 加倍
    return this.selectedTypeValue !== 'All' ? `:${this.selectedTypeValue}`: '';
  }

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
              size: "20",
              font: {
                size: '12',
                color: `#${this.mainColor.hex}`
              },
          },
          Tool: {
            label: "name",
            value: "pagerank",
            size: "20",
            font: {
              size: '12',
              color: `#${this.mainColor.hex}`
            }
          },
          Movie: {
            label: "title",
            value: "pagerank",
            size: "20",
            font: {
              size: '12',
              color: `#${this.mainColor.hex}`
            },
            // color: {
            //   background: "#e9a89b",
            //   highlight: "#e9a89b",
            // }
          },
          Person: {
            label: "name",
            value: "pagerank",
            size: "20",
            font: {
              size: '12',
              color: `#${this.mainColor.hex}`
            }
          },
      },
      relationships: {
        ACTED_IN: {
          [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
              static: {
                  label: "ACTED_IN",
                  color: `#${this.lineColor.hex}` || '#000000',
                  font: {
                      "background": "none",
                      "strokeWidth": "10",
                      "size": 12,
                      "color": `#${this.colorCtr.hex}` || '#000000',
                  }
              }
          }
      },
      WROTE: {
        [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
            static: {
                label: "WROTE",
                color: `#${this.lineColor.hex}` || '#000000',
                font: {
                    "background": "none",
                    "strokeWidth": "10",
                    "size": 12,
                    "color": `#${this.colorCtr.hex}` || '#000000',
                }
            }
        }
    },
    DIRECTED: {
      [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
          static: {
              label: "DIRECTED",
              color: `#${this.lineColor.hex}` || '#000000',
              font: {
                  "background": "none",
                  "strokeWidth": "10",
                  "size": 12,
                  "color": `#${this.colorCtr.hex}` || '#000000',
              }
          }
      }
  },
      CONTAINS: {
          [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
              static: {
                  label: "CONTAINS",
                  color: `#${this.lineColor.hex}` || '#000000',
                  font: {
                      "background": "none",
                      "strokeWidth": "10",
                      "size": 12,
                      "color": `#${this.colorCtr.hex}` || '#000000',
                  }
              }
          }
      }
      },
      visConfig: {
        autoResize: true,
        // clickToUse: true, // 點擊canvas後才可異動
        nodes: {
            shape: 'circle',
            borderWidth: 0,
            widthConstraint: {
              minimum: 200,
              maximum: 200
          },
            // physics: false, // 節點可移動到固定位置
        },
        physics: {
          enabled: true,
          barnesHut: {
            // centralGravity: 0,
            // gravitationalConstant: -20000,  //调整引力常数，根据需要适应距离
            // springLength: 150, // 调整弹簧长度，根据需要适应距离
          },
        },
        edges: {
            // arrows: {
            //     to: true,
            // },
            color: `#${this.colorCtr.hex}` || '#000000', //連結線顏色
            length: this.lengthValue, //連結線長度
            hoverWidth: 200,
            // smooth: {
            //   enabled: false,
            //   type: "WROTE",
            //   roundness: 0,
            // },
        },
    },
      initialCypher: this.cypherText ? this.cypherText : `MATCH (n1${this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`
 }
    var viz = new NeoVis(config) as any;
    viz.render();
    var setSelectedNodeData=(data: any)=>{
      this.selectedNodeData = data;
    }

    this.selectedNodeData = viz.registerOnEvent('clickNode', function (event: any) {
      console.log(event.node.raw.properties);
      const dataList = Object.keys(event.node.raw.properties).map(item=> ` ${item}:${event.node.raw.properties[item]}`)
      setSelectedNodeData(dataList);
    });

}

saveCanvasAsImage() {
  const canvas = document.getElementsByTagName('canvas')[0] as any;
  canvas.addEventListener('contextmenu', function (e:any) {
    e.preventDefault(); // 阻止默认的右键上下文菜单弹出
  });
  const context = canvas.getContext('2d');
  context.globalAlpha = 0.5; // 0.5 表示半透明
  context.font = '90px Arial';
  context.fillStyle = '#818181'; // 文本颜色
  context.fillText('浮水印', 300, 280); // 替换为你的文本内容和坐标 (x, y)

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'neoVisChart.png';
  link.click();
  context.globalAlpha = 1; // 恢复为完全不透明
}

}
