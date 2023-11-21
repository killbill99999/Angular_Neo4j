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
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import { ThemePalette } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import JsPDF from "jspdf";

import * as neo4j from 'neo4j-driver';
import html2Canvas from "html2canvas";


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
  imports: [MatButtonModule, MatInputModule, MatTableModule, MatIconModule, NgFor, FormsModule, NgxMatColorPickerModule, MatSelectModule, MatFormFieldModule, MatSliderModule, MatSlideToggleModule],
  providers: [
    { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
   ],
})
export class ProductDetailComponent implements AfterViewInit{
  ngAfterViewInit() {
    // this.getNodeNames();
    this.draw();
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

  nameKeyWord: string = '';
  titleKeyWord: string = '';
  releasedKeyWord: string = '';
  taglineKeyWord: string = '';
  cypherText: string = '';
  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  data: PeriodicElement[] = ELEMENT_DATA;

  selectedNodeName: string = '';

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

  removeItem: boolean = false;
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
  selectedEdgeData:string[] = [];

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

  draw(text?: string) {
    console.log(`MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`)
    const cypherRender = () => {
      if(this.nameKeyWord && !this.titleKeyWord){
        console.log(`MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
        return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
      }
      if(this.titleKeyWord && !this.nameKeyWord){
        console.log(`MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
        return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
      }
      if(this.titleKeyWord && this.nameKeyWord){
        console.log(`MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' OR n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
        return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' OR n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
      }
      if(this.titleKeyWord && this.releasedKeyWord && this.taglineKeyWord){
        console.log(`MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.released = '${this.releasedKeyWord}' AND n1.title = '${this.titleKeyWord}' AND n1.tagline = '${this.taglineKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
        return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.released = '${this.releasedKeyWord}' AND n1.title = '${this.titleKeyWord}' AND n1.tagline = '${this.taglineKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
      }
      return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`
     }
    var config : NeovisConfig = {
      containerId: "viz",
      neo4j: {
        //   serverUrl: "neo4j://294ad229.databases.neo4j.io",
        serverUrl: "bolt://10.20.30.34:7687",
          serverUser: "neo4j",
          serverPassword: "password",
        //   serverPassword: "4IkDPJSFGw_oTrOZdCZrC7nzW00eFmrBzJLq8UycfdQ",
        //   driverConfig: { 
        //     encrypted: "ENCRYPTION_ON",
        //     trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES"
        //     }
      },
      labels: {
          DB: {
            label: "name",
          },
          Tool: {
            label: "name",
          },
        //   Database: {
        //     label: "name",
        //   },
        //   Message: {
        //     label: "name",
        //   },
          Movie: {
            label: "title" || "name",
            color: "#000000", 
          },
          Person: {
            label: "name",
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
              },
            //   function: {
            //     title: (edge:any) => {
            //         return viz.nodeToHtml(edge, undefined);
            //     }
            // },
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
        configure: {
            filter:function (option:any, path:any) {
                console.log(option);
                return path.indexOf('physics') !== -1;
              },
              showButton: true,
        },
        // clickToUse: true, // 點擊canvas後才可異動
        // layout:{
        //     hierarchical: true,
        // },
        manipulation: {
            addNode: function(nodeData:any,callback:any) {
              nodeData.label = 'hello world';
              callback(nodeData);
            },
            deleteNode: function(nodeData:any,callback:any) {
                nodeData.label = 'hello world';
                callback(nodeData);
            },
            controlNodeStyle:{
                shape:'dot',
                size:6,
                color: {
                  background: '#ff0000',
                  border: '#3c3c3c',
                  highlight: {
                    background: '#07f968',
                    border: '#3c3c3c'
                  }
                },
                borderWidth: 2,
                borderWidthSelected: 2
              }
          },
        interaction:{
            multiselect: true,
            navigationButtons: true,
            keyboard: {enabled: true}
        },
        nodes: {
            shape: 'circle',
            borderWidth: 0,
            widthConstraint: {
              minimum: 200,
              maximum: 200
            },
            color: {
                background: "#FF5733", // 设置节点背景颜色
                border: "#D32F2F", // 设置节点边框颜色
                highlight: {
                  background: "#FFC107", // 设置节点被高亮时的背景颜色
                  border: "#FF9800", // 设置节点被高亮时的边框颜色
                },
              },
              chosen: {
                // chosen可以抓取到node的id和樣式
                node: function(values: any,
                    id: any,
                    selected: boolean,
                    hovered: boolean){
                    console.log(values, id, selected, hovered);
                    console.log(viz.network.getConnectedNodes(id));
                },
                label: true,
              }
            // physics: false, // 節點可移動到固定位置
        },
        physics: {
            forceAtlas2Based: {
              gravitationalConstant: -200,
              centralGravity: 0.02,
              springLength: 100,
              springConstant: 0.01,
            },
            maxVelocity: 50,
            solver: "forceAtlas2Based",
            timestep: 0.35,
            stabilization: { iterations: 150 },
          },
        // physics: {
        //   enabled: true,
        //   barnesHut: {
        //     // centralGravity: 0,
        //     // gravitationalConstant: -20000,  //调整引力常数，根据需要适应距离
        //     // springLength: 150, // 调整弹簧长度，根据需要适应距离
        //   },
        // },

        groups: {
            Person: {
              color: {
                background: "#FF5733", // 设置节点背景颜色
                // border: "#D32F2F", // 设置节点边框颜色
                // highlight: {
                //   background: "#FFC107", // 设置节点被高亮时的背景颜色
                //   border: "#FF9800", // 设置节点被高亮时的边框颜色
                // },
              },
            },
        },

        edges: {
            // arrows: {
            //     to: true,
            // },
            color: `#${this.colorCtr.hex}` || '#000000', //連結線顏色
            length: this.lengthValue, //連結線長度
            hoverWidth: 200,
            widthConstraint: true,
            // chosen可以抓取到relationship的id和樣式
            chosen: { 
                edge: function(values: any,
                    id: any,
                    selected: boolean,
                    hovered: boolean){
                    console.log(values, id, selected, hovered);
                    console.log(viz.network.getConnectedNodes(id));
                } as any,
                label: true,
              },
            // smooth: {
            //   enabled: false,
            //   type: "WROTE",
            //   roundness: 0,
            // },
        },
    },
      initialCypher: cypherRender(),
    // initialCypher: "MATCH p=()-[:FRIEND_OF]->() RETURN p",
 }
    var viz = new NeoVis(config) as any;
    viz.render();
    var setSelectedNodeData=(data: any)=>{
      this.selectedNodeData = data;
    }

    const setSelectedNodeName = (name?: string, title?: string) =>{
      if(name){
        this.selectedNodeName = `{name:'${name}'}`;
      }
      if(title){
        this.selectedNodeName = `{title:'${title}'}`;
      }
    }

    // updateWithCypher用於更輕量級的更新，而不必完全重新渲染整個圖形。
    const updateViz = (name?: string, title?: string) =>{
      viz.clearNetwork();
      if(name){
        viz.updateWithCypher(`MATCH (n1{name:'${name}'})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`);
      }
      if(title){
        viz.updateWithCypher(`MATCH (n1{title:'${title}'})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`);
      }
    }

    // viz.registerOnEvent('clickRelationship', function (properties: any) {
    //     console.log(properties);
    // });

    const isRemove = () => {
        return this.removeItem
    }
    const removeItem = (nodeId:any) => {
        viz.clearNetwork();
        viz.updateWithCypher(`MATCH (n1)<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE ID(n1) <> ' + ${nodeId} + ' RETURN r, n1, n2${this.computedLimitCount}`);
    }

    this.selectedEdgeData = viz.registerOnEvent('clickEdge', async function (event: any) {
        console.log(event);
        // viz.clearNetwork();
        viz.updateWithFunction(function(){
            setColor();
        })
    });
    const setColor = () => {
        this.lineColor = "#FF5733"
    }

    this.selectedNodeData = viz.registerOnEvent('clickNode', async function (event: any) {
      if(!isRemove() && event.node){
      console.log(event);
      const dataList = Object.keys(event.node.raw.properties).map(item=> ` ${item}:${event.node.raw.properties[item]}`)
      setSelectedNodeData(dataList);
      updateViz(event.node.raw.properties?.name, event.node.raw.properties?.title);
    }
    if(isRemove()){
        removeItem(event.nodeId);
    }
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

  async toCanvasAndDownload(){
  const toCanvasElement = document.getElementById("viz");
  let blob = null;
  if (toCanvasElement) {
    blob = await html2Canvas(toCanvasElement, {
      allowTaint: false,
      useCORS: true,
    }).then(function (canvas) {
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;
      const position = 0;
      const imgWidth = 595.28;
      const imgHeight = (592.28 / contentWidth) * contentHeight;

      const pageData = canvas.toDataURL("image/jpeg", 1.0);
      console.log(pageData);
      const PDF = new JsPDF("l", "pt", [imgWidth, imgHeight + 30]);

      PDF.addImage(
        pageData,
        "JPEG",
        10,
        position + 10,
        imgWidth - 20,
        imgHeight + 10
      );
        PDF.save("Neo4j Neovis" + ".pdf");
        return null;
    });
  }
}

}
