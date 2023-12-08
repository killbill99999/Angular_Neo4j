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
// import { Network, network } from 'vis-network';

import * as neo4j from 'neo4j-driver';
import html2Canvas from "html2canvas";
import { network } from 'vis-network';


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

//   draw(){
//     var config: any = {
//         container_id: "viz",
//         labels: {
//           "Person": {
//             "caption": "name",
//             "size": "pagerank",
//             "community": "community"
//           }
//         },
//         relationships: {
//           "FRIEND_OF": {
//             "caption": false,
//             "thickness": "weight"
//           }
//         },
//       };
      
//       var viz = new NeoVis(config);
      
//       // 提供本地節點和關係數據
//       var nodes = [
//         { id: 1, labels: ["Person"], properties: { name: "Alice", pagerank: 0.5, community: 1 } },
//         { id: 2, labels: ["Person"], properties: { name: "Bob", pagerank: 0.7, community: 1 } },
//         // 添加更多節點...
//       ];
      
//       var edges = [
//         { id: 1, source: 1, target: 2, type: "FRIEND_OF", properties: { weight: 0.8 } },
//         // 添加更多關係...
//       ];
      
//       viz.renderWithCypher("MATCH (n:Person)-[r:FRIEND_OF]->(m:Person) RETURN * LIMIT 100", { nodes: nodes, relationships: edges });
//   }


draw() {
//     async function *getData() {
//         const data = await (await fetch('https://api.stackexchange.com/2.2/questions?pagesize=100&order=desc&sort=creation&tagged=neo4j&site=stackoverflow&filter=!5-i6Zw8Y)4W7vpy91PMYsKM-k9yzEsSC1_Uxlf')).json();
//         // console.log(data)
//         // return data.item
//            for(const da of data) {
//                yield da;
//           }
//    }

async function easyFunction() {
    return (await fetch('https://api.stackexchange.com/2.2/questions?pagesize=100&order=desc&sort=creation&tagged=neo4j&site=stackoverflow&filter=!5-i6Zw8Y)4W7vpy91PMYsKM-k9yzEsSC1_Uxlf')).json();
}

async function* iterableFunction() {
    const allIds = await (await fetch('https://api.stackexchange.com/2.2/questions?pagesize=100&order=desc&sort=creation&tagged=neo4j&site=stackoverflow&filter=!5-i6Zw8Y)4W7vpy91PMYsKM-k9yzEsSC1_Uxlf')).json();
    for(const id of allIds) {
        yield *(await (await fetch('https://api.stackexchange.com/2.2/questions?pagesize=100&order=desc&sort=creation&tagged=neo4j&site=stackoverflow&filter=!5-i6Zw8Y)4W7vpy91PMYsKM-k9yzEsSC1_Uxlf')).json());
    }
}


const data = [
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 135,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Walk a mile you'll never forget.",
            "title": "The Green Mile",
            "released": {
              "low": 1999,
              "high": 0
            }
          },
          "elementId": "135"
        },
        {
          "identity": {
            "low": 186,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 135,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Paul Edgecomb"
            ]
          },
          "elementId": "186",
          "startNodeElementId": "76",
          "endNodeElementId": "135"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 167,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Once in a lifetime you get a chance to do something different.",
            "title": "A League of Their Own",
            "released": {
              "low": 1992,
              "high": 0
            }
          },
          "elementId": "167"
        },
        {
          "identity": {
            "low": 238,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 167,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Jimmy Dugan"
            ]
          },
          "elementId": "238",
          "startNodeElementId": "76",
          "endNodeElementId": "167"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 83,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "A story of love, lava and burning desire.",
            "title": "Joe Versus the Volcano",
            "released": {
              "low": 1990,
              "high": 0
            }
          },
          "elementId": "83"
        },
        {
          "identity": {
            "low": 102,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 83,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Joe Banks"
            ]
          },
          "elementId": "102",
          "startNodeElementId": "76",
          "endNodeElementId": "83"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 110,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Everything is connected",
            "title": "Cloud Atlas",
            "released": {
              "low": 2012,
              "high": 0
            }
          },
          "elementId": "110"
        },
        {
          "identity": {
            "low": 141,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 110,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Zachry",
              "Dr. Henry Goose",
              "Isaac Sachs",
              "Dermot Hoggins"
            ]
          },
          "elementId": "141",
          "startNodeElementId": "76",
          "endNodeElementId": "110"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 78,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "What if someone you never met, someone you never saw, someone you never knew was the only someone for you?",
            "title": "Sleepless in Seattle",
            "released": {
              "low": 1993,
              "high": 0
            }
          },
          "elementId": "78"
        },
        {
          "identity": {
            "low": 95,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 78,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Sam Baldwin"
            ]
          },
          "elementId": "95",
          "startNodeElementId": "76",
          "endNodeElementId": "78"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 90,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "In every life there comes a time when that thing you dream becomes that thing you do",
            "title": "That Thing You Do",
            "released": {
              "low": 1996,
              "high": 0
            }
          },
          "elementId": "90"
        },
        {
          "identity": {
            "low": 114,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 90,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Mr. White"
            ]
          },
          "elementId": "114",
          "startNodeElementId": "76",
          "endNodeElementId": "90"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 149,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Houston, we have a problem.",
            "title": "Apollo 13",
            "released": {
              "low": 1995,
              "high": 0
            }
          },
          "elementId": "149"
        },
        {
          "identity": {
            "low": 206,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 149,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Jim Lovell"
            ]
          },
          "elementId": "206",
          "startNodeElementId": "76",
          "endNodeElementId": "149"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 164,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "A stiff drink. A little mascara. A lot of nerve. Who said they couldn't bring down the Soviet empire.",
            "title": "Charlie Wilson's War",
            "released": {
              "low": 2007,
              "high": 0
            }
          },
          "elementId": "164"
        },
        {
          "identity": {
            "low": 232,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 164,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Rep. Charlie Wilson"
            ]
          },
          "elementId": "232",
          "startNodeElementId": "76",
          "endNodeElementId": "164"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 116,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Break The Codes",
            "title": "The Da Vinci Code",
            "released": {
              "low": 2006,
              "high": 0
            }
          },
          "elementId": "116"
        },
        {
          "identity": {
            "low": 150,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 116,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Dr. Robert Langdon"
            ]
          },
          "elementId": "150",
          "startNodeElementId": "76",
          "endNodeElementId": "116"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 72,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "At odds in life... in love on-line.",
            "title": "You've Got Mail",
            "released": {
              "low": 1998,
              "high": 0
            }
          },
          "elementId": "72"
        },
        {
          "identity": {
            "low": 88,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 72,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Joe Fox"
            ]
          },
          "elementId": "88",
          "startNodeElementId": "76",
          "endNodeElementId": "72"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 155,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "At the edge of the world, his journey begins.",
            "title": "Cast Away",
            "released": {
              "low": 2000,
              "high": 0
            }
          },
          "elementId": "155"
        },
        {
          "identity": {
            "low": 217,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 155,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Chuck Noland"
            ]
          },
          "elementId": "217",
          "startNodeElementId": "76",
          "endNodeElementId": "155"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 76,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "76"
        },
        {
          "identity": {
            "low": 166,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "This Holiday Season... Believe",
            "title": "The Polar Express",
            "released": {
              "low": 2004,
              "high": 0
            }
          },
          "elementId": "166"
        },
        {
          "identity": {
            "low": 236,
            "high": 0
          },
          "start": {
            "low": 76,
            "high": 0
          },
          "end": {
            "low": 166,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Hero Boy",
              "Father",
              "Conductor",
              "Hobo",
              "Scrooge",
              "Santa Claus"
            ]
          },
          "elementId": "236",
          "startNodeElementId": "76",
          "endNodeElementId": "166"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2152,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "In every life there comes a time when that thing you dream becomes that thing you do",
            "title": "That Thing You Do",
            "released": {
              "low": 1996,
              "high": 0
            }
          },
          "elementId": "2152"
        },
        {
          "identity": {
            "low": 6330,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2152,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Mr. White"
            ]
          },
          "elementId": "6330",
          "startNodeElementId": "2138",
          "endNodeElementId": "2152"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2172,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Everything is connected",
            "title": "Cloud Atlas",
            "released": {
              "low": 2012,
              "high": 0
            }
          },
          "elementId": "2172"
        },
        {
          "identity": {
            "low": 6357,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2172,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Zachry",
              "Dr. Henry Goose",
              "Isaac Sachs",
              "Dermot Hoggins"
            ]
          },
          "elementId": "6357",
          "startNodeElementId": "2138",
          "endNodeElementId": "2172"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2228,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "This Holiday Season... Believe",
            "title": "The Polar Express",
            "released": {
              "low": 2004,
              "high": 0
            }
          },
          "elementId": "2228"
        },
        {
          "identity": {
            "low": 6452,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2228,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Hero Boy",
              "Father",
              "Conductor",
              "Hobo",
              "Scrooge",
              "Santa Claus"
            ]
          },
          "elementId": "6452",
          "startNodeElementId": "2138",
          "endNodeElementId": "2228"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2229,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Once in a lifetime you get a chance to do something different.",
            "title": "A League of Their Own",
            "released": {
              "low": 1992,
              "high": 0
            }
          },
          "elementId": "2229"
        },
        {
          "identity": {
            "low": 6454,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2229,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Jimmy Dugan"
            ]
          },
          "elementId": "6454",
          "startNodeElementId": "2138",
          "endNodeElementId": "2229"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2197,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Walk a mile you'll never forget.",
            "title": "The Green Mile",
            "released": {
              "low": 1999,
              "high": 0
            }
          },
          "elementId": "2197"
        },
        {
          "identity": {
            "low": 6402,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2197,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Paul Edgecomb"
            ]
          },
          "elementId": "6402",
          "startNodeElementId": "2138",
          "endNodeElementId": "2197"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2217,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "At the edge of the world, his journey begins.",
            "title": "Cast Away",
            "released": {
              "low": 2000,
              "high": 0
            }
          },
          "elementId": "2217"
        },
        {
          "identity": {
            "low": 6433,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2217,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Chuck Noland"
            ]
          },
          "elementId": "6433",
          "startNodeElementId": "2138",
          "endNodeElementId": "2217"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2178,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Break The Codes",
            "title": "The Da Vinci Code",
            "released": {
              "low": 2006,
              "high": 0
            }
          },
          "elementId": "2178"
        },
        {
          "identity": {
            "low": 6366,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2178,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Dr. Robert Langdon"
            ]
          },
          "elementId": "6366",
          "startNodeElementId": "2138",
          "endNodeElementId": "2178"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2134,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "At odds in life... in love on-line.",
            "title": "You've Got Mail",
            "released": {
              "low": 1998,
              "high": 0
            }
          },
          "elementId": "2134"
        },
        {
          "identity": {
            "low": 6304,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2134,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Joe Fox"
            ]
          },
          "elementId": "6304",
          "startNodeElementId": "2138",
          "endNodeElementId": "2134"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2140,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "What if someone you never met, someone you never saw, someone you never knew was the only someone for you?",
            "title": "Sleepless in Seattle",
            "released": {
              "low": 1993,
              "high": 0
            }
          },
          "elementId": "2140"
        },
        {
          "identity": {
            "low": 6311,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2140,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Sam Baldwin"
            ]
          },
          "elementId": "6311",
          "startNodeElementId": "2138",
          "endNodeElementId": "2140"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2145,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "A story of love, lava and burning desire.",
            "title": "Joe Versus the Volcano",
            "released": {
              "low": 1990,
              "high": 0
            }
          },
          "elementId": "2145"
        },
        {
          "identity": {
            "low": 6318,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2145,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Joe Banks"
            ]
          },
          "elementId": "6318",
          "startNodeElementId": "2138",
          "endNodeElementId": "2145"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2226,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "A stiff drink. A little mascara. A lot of nerve. Who said they couldn't bring down the Soviet empire.",
            "title": "Charlie Wilson's War",
            "released": {
              "low": 2007,
              "high": 0
            }
          },
          "elementId": "2226"
        },
        {
          "identity": {
            "low": 6448,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2226,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Rep. Charlie Wilson"
            ]
          },
          "elementId": "6448",
          "startNodeElementId": "2138",
          "endNodeElementId": "2226"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    },
    {
      "keys": [
        "tom",
        "tomHanksMovies",
        "r"
      ],
      "length": 3,
      "_fields": [
        {
          "identity": {
            "low": 2138,
            "high": 0
          },
          "labels": [
            "Person"
          ],
          "properties": {
            "born": {
              "low": 1956,
              "high": 0
            },
            "name": "Tom Hanks"
          },
          "elementId": "2138"
        },
        {
          "identity": {
            "low": 2211,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "tagline": "Houston, we have a problem.",
            "title": "Apollo 13",
            "released": {
              "low": 1995,
              "high": 0
            }
          },
          "elementId": "2211"
        },
        {
          "identity": {
            "low": 6422,
            "high": 0
          },
          "start": {
            "low": 2138,
            "high": 0
          },
          "end": {
            "low": 2211,
            "high": 0
          },
          "type": "ACTED_IN",
          "properties": {
            "roles": [
              "Jim Lovell"
            ]
          },
          "elementId": "6422",
          "startNodeElementId": "2138",
          "endNodeElementId": "2211"
        }
      ],
      "_fieldLookup": {
        "tom": 0,
        "tomHanksMovies": 1,
        "r": 2
      }
    }
  ]

const data2 = [{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},{"identity":{"low":0,"high":0},"start":{"low":0,"high":0},"end":{"low":1,"high":0},"type":"INTERACTS","properties":{"wight":{"low":1,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},{"start":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"end":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"segments":[{"start":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"relationship":{"identity":{"low":0,"high":0},"start":{"low":0,"high":0},"end":{"low":1,"high":0},"type":"INTERACTS","properties":{"wight":{"low":1,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"end":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},{"identity":{"low":1,"high":0},"start":{"low":1,"high":0},"end":{"low":0,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},{"start":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"end":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"segments":[{"start":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"relationship":{"identity":{"low":1,"high":0},"start":{"low":1,"high":0},"end":{"low":0,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"end":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"identity":{"low":2,"high":0},"start":{"low":2,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:2","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"start":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"segments":[{"start":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"relationship":{"identity":{"low":2,"high":0},"start":{"low":2,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:2","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"identity":{"low":3,"high":0},"start":{"low":3,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:3","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"start":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"segments":[{"start":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"relationship":{"identity":{"low":3,"high":0},"start":{"low":3,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:3","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"identity":{"low":4,"high":0},"start":{"low":2,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:4","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"start":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"segments":[{"start":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"relationship":{"identity":{"low":4,"high":0},"start":{"low":2,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:4","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"identity":{"low":5,"high":0},"start":{"low":3,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:5","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"start":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"segments":[{"start":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"relationship":{"identity":{"low":5,"high":0},"start":{"low":3,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:5","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},{"identity":{"low":6,"high":0},"start":{"low":0,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:6","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"start":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"segments":[{"start":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"relationship":{"identity":{"low":6,"high":0},"start":{"low":0,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:6","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},{"identity":{"low":7,"high":0},"start":{"low":1,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:7","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},{"start":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"segments":[{"start":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"relationship":{"identity":{"low":7,"high":0},"start":{"low":1,"high":0},"end":{"low":2,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:7","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"},"end":{"identity":{"low":2,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:2"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},{"identity":{"low":8,"high":0},"start":{"low":0,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:8","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"start":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"segments":[{"start":{"identity":{"low":0,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":10,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12","pagerank":"test2"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0"},"relationship":{"identity":{"low":8,"high":0},"start":{"low":0,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:8","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:0","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}},{"keys":["n","r","m","a"],"length":4,"_fields":[{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},{"identity":{"low":9,"high":0},"start":{"low":1,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:9","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},{"start":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"segments":[{"start":{"identity":{"low":1,"high":0},"labels":["Character"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"size":{"low":100,"high":0},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"pagerank":"test","community":"tew1"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1"},"relationship":{"identity":{"low":9,"high":0},"start":{"low":1,"high":0},"end":{"low":3,"high":0},"type":"INTERACTS","properties":{"wight":{"low":2,"high":0}},"elementId":"5:def89b3f-243a-4376-88e7-ceafa6f48c7a:9","startNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:1","endNodeElementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"},"end":{"identity":{"low":3,"high":0},"labels":["Character2"],"properties":{"test2":{"year":{"low":2023,"high":0},"month":{"low":5,"high":0},"day":{"low":11,"high":0}},"test":[{"low":1,"high":0},{"low":2,"high":0},{"low":3,"high":0},{"low":4,"high":0}],"community":"tew12"},"elementId":"4:def89b3f-243a-4376-88e7-ceafa6f48c7a:3"}}],"length":1}],"_fieldLookup":{"n":0,"r":1,"m":2,"a":3}}];
		
function syncDataFunction() {
    return data as any;
}

function *syncGeneratorData() {
    for(const d of data) {
        yield d;
        console.log(d)
    }
}

function getRandomInt(max: any) {
      return Math.floor(Math.random() * max);
}

const avialibleFunctions = [syncDataFunction, syncGeneratorData];


var config: NeovisConfig = {
 containerId: "viz",
 consoleDebug: true,
 labels: {
  Character: {
   label: "name",
   value: "pagerank",
   group: "community",
   [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
    function: {
     title: NeoVis.objectToTitleHtml
    },
   }
  }
 },
 relationships: {
  INTERACTS: {
   value: "weight",
   [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
    function: {
     title: NeoVis.objectToTitleHtml
    },
   }
  }
 },
 dataFunction: avialibleFunctions[getRandomInt(avialibleFunctions.length)]
};

var viz = new NeoVis(config);

viz.render();
console.log(viz);

}

//   draw(text?: string) {
//     console.log(`MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`)
//     const cypherRender = () => {
//       if(this.nameKeyWord && !this.titleKeyWord){
//         console.log(`MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
//         return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
//       }
//       if(this.titleKeyWord && !this.nameKeyWord){
//         console.log(`MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
//         return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
//       }
//       if(this.titleKeyWord && this.nameKeyWord){
//         console.log(`MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' OR n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
//         return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.name = '${this.nameKeyWord}' OR n1.title = '${this.titleKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
//       }
//       if(this.titleKeyWord && this.releasedKeyWord && this.taglineKeyWord){
//         console.log(`MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.released = '${this.releasedKeyWord}' AND n1.title = '${this.titleKeyWord}' AND n1.tagline = '${this.taglineKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`);
//         return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE n1.released = '${this.releasedKeyWord}' AND n1.title = '${this.titleKeyWord}' AND n1.tagline = '${this.taglineKeyWord}' RETURN r, n1, n2${this.computedLimitCount}`
//       }
//       return this.cypherText ? this.cypherText : `MATCH (n1${text || this.computedValue})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`
//      }
//     var config : NeovisConfig = {
//       containerId: "viz",
//       neo4j: {
//         //   serverUrl: "neo4j://294ad229.databases.neo4j.io",
//         serverUrl: "bolt://10.20.30.34:7687",
//         serverUser: "neo4j",
//         serverPassword: "password",
//         //   serverPassword: "4IkDPJSFGw_oTrOZdCZrC7nzW00eFmrBzJLq8UycfdQ",
//         //   driverConfig: { 
//         //     encrypted: "ENCRYPTION_ON",
//         //     trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES"
//         //     }
//       },
//       labels:{
//         Person: {
//             label: "name",
//           }
//       },
//     //   labels: {
//     //       DB: {
//     //         label: "name",
//     //       },
//     //       Tool: {
//     //         label: "name",
//     //       },
//     //     //   Database: {
//     //     //     label: "name",
//     //     //   },
//     //     //   Message: {
//     //     //     label: "name",
//     //     //   },
//     //       Movie: {
//     //         label: "title" || "name",
//     //         color: "#000000", 
//     //       },
//     //       Person: {
//     //         label: "name",
//     //       },
//     //   },
//     relationships: {
//         FRIEND_OF: {
//             [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
//                             static: {
//                                 label: "FRIEND_OF",
//                                 color: `#${this.lineColor.hex}` || '#000000',
//                                 font: {
//                                     "background": "none",
//                                     "strokeWidth": "10",
//                                     "size": 12,
//                                     "color": `#${this.colorCtr.hex}` || '#000000',
//                                 }
//                             }
//                         }
//           }
//     },
//     //   relationships: {
//     //     ACTED_IN: {
//     //       [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
//     //           static: {
//     //               label: "ACTED_IN",
//     //               color: `#${this.lineColor.hex}` || '#000000',
//     //               font: {
//     //                   "background": "none",
//     //                   "strokeWidth": "10",
//     //                   "size": 12,
//     //                   "color": `#${this.colorCtr.hex}` || '#000000',
//     //               }
//     //           },
//     //         //   function: {
//     //         //     title: (edge:any) => {
//     //         //         return viz.nodeToHtml(edge, undefined);
//     //         //     }
//     //         // },
//     //       }
//     //     },
//     //     WROTE: {
//     //         [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
//     //             static: {
//     //                 label: "WROTE",
//     //                 color: `#${this.lineColor.hex}` || '#000000',
//     //                 font: {
//     //                     "background": "none",
//     //                     "strokeWidth": "10",
//     //                     "size": 12,
//     //                     "color": `#${this.colorCtr.hex}` || '#000000',
//     //                 }
//     //             }
//     //         }
//     //     },
//     //     DIRECTED: {
//     //         [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
//     //             static: {
//     //                 label: "DIRECTED",
//     //                 color: `#${this.lineColor.hex}` || '#000000',
//     //                 font: {
//     //                     "background": "none",
//     //                     "strokeWidth": "10",
//     //                     "size": 12,
//     //                     "color": `#${this.colorCtr.hex}` || '#000000',
//     //                 }
//     //             }
//     //         }
//     //     },
//     //     CONTAINS: {
//     //         [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
//     //             static: {
//     //                 label: "CONTAINS",
//     //                 color: `#${this.lineColor.hex}` || '#000000',
//     //                 font: {
//     //                     "background": "none",
//     //                     "strokeWidth": "10",
//     //                     "size": 12,
//     //                     "color": `#${this.colorCtr.hex}` || '#000000',
//     //                 }
//     //             }
//     //         }
//     //     }
//     //   },
//       visConfig: {
//         autoResize: true,
//         configure: {
//             filter:function (option:any, path:any) {
//                 console.log(option, path);
//                 return path.indexOf('nodes') !== -1;
//               },
//               showButton: true,
//         },
//         // clickToUse: true, // 點擊canvas後才可異動
//         // layout:{
//         //     hierarchical: true,
//         // },
//         manipulation: {
//             addNode: function(nodeData:any,callback:any) {
//               nodeData.label = 'hello world';
//               callback(nodeData);
//             },
//             deleteNode: function(nodeData:any,callback:any) {
//                 nodeData.label = 'hello world';
//                 callback(nodeData);
//             },
//             controlNodeStyle:{
//                 shape:'dot',
//                 size:6,
//                 color: {
//                   background: '#ff0000',
//                   border: '#3c3c3c',
//                   highlight: {
//                     background: '#07f968',
//                     border: '#3c3c3c'
//                   }
//                 },
//                 borderWidth: 2,
//                 borderWidthSelected: 2
//               }
//           },
//         interaction:{
//             multiselect: true,
//             navigationButtons: true,
//             keyboard: {enabled: true}
//         },
//         nodes: {
//             shape: 'circle',
//             borderWidth: 0,
//             widthConstraint: {
//               minimum: 200,
//               maximum: 200
//             },
//             color: {
//                 background: "#FF5733", // 设置节点背景颜色
//                 border: "#D32F2F", // 设置节点边框颜色
//                 highlight: {
//                   background: "#FFC107", // 设置节点被高亮时的背景颜色
//                   border: "#FF9800", // 设置节点被高亮时的边框颜色
//                 },
//               },
//               chosen: {
//                 // chosen可以抓取到node的id和樣式
//                 node: function(values: any,
//                     id: any,
//                     selected: boolean,
//                     hovered: boolean){
//                     // console.log(viz.network.cluster());
//                     console.log(values, id, selected, hovered);
//                     console.log(viz.network.getConnectedNodes(id));
//                 },
//                 label: true,
//               }
//             // physics: false, // 節點可移動到固定位置
//         },
//         physics: {
//             forceAtlas2Based: {
//               gravitationalConstant: -200,
//               centralGravity: 0.02,
//               springLength: 100,
//               springConstant: 0.01,
//             },
//             maxVelocity: 50,
//             solver: "forceAtlas2Based",
//             timestep: 0.35,
//             stabilization: { iterations: 150 },
//           },
//         // physics: {
//         //   enabled: true,
//         //   barnesHut: {
//         //     // centralGravity: 0,
//         //     // gravitationalConstant: -20000,  //调整引力常数，根据需要适应距离
//         //     // springLength: 150, // 调整弹簧长度，根据需要适应距离
//         //   },
//         // },

//         groups: {
//             Person: {
//               color: {
//                 background: "#FF5733", // 设置节点背景颜色
//                 // border: "#D32F2F", // 设置节点边框颜色
//                 // highlight: {
//                 //   background: "#FFC107", // 设置节点被高亮时的背景颜色
//                 //   border: "#FF9800", // 设置节点被高亮时的边框颜色
//                 // },
//               },
//             },
//         },

//         edges: {
//             // arrows: {
//             //     to: true,
//             // },
//             color: `#${this.colorCtr.hex}` || '#000000', //連結線顏色
//             length: this.lengthValue, //連結線長度
//             hoverWidth: 200,
//             widthConstraint: true,
//             // chosen可以抓取到relationship的id和樣式
//             chosen: { 
//                 edge: function(values: any,
//                     id: any,
//                     selected: boolean,
//                     hovered: boolean){
//   viz.network.setData({nodes: nodes, edges: edges});
//                     console.log(values, id, selected, hovered);
//                     console.log(viz.network.getConnectedNodes(id));
//                 } as any,
//                 label: true,
//               },
//             // smooth: {
//             //   enabled: false,
//             //   type: "WROTE",
//             //   roundness: 0,
//             // },
//         },
//     },
//       initialCypher: cypherRender(),
//     // initialCypher: "MATCH p=()-[:FRIEND_OF]->() RETURN p",
//  }
//  // 提供本地節點和關係數據
//  var viz = new NeoVis(config) as any;

// var nodes = [
//     { id: 1, labels: ["Person"], properties: { name: "Alice", pagerank: 0.5, community: 1 } },
//     { id: 2, labels: ["Person"], properties: { name: "Bob", pagerank: 0.7, community: 1 } },
//     { id: 3, labels: ["Person"], properties: { name: "Bob", pagerank: 0.6, community: 1 }},
//     // 添加更多節點...
//   ];
  
//   var edges = [
//     { id: 1, source: 1, target: 2, type: "FRIEND_OF", properties: { weight: 0.8 } },
//     // 添加更多關係...
//   ];
//     viz.renderWithCypher("MATCH (n:Person)-[r:FRIEND_OF]->(m:Person) RETURN * LIMIT 100", { nodes: nodes, relationships: edges });
//     // viz.render();
    
//     var setSelectedNodeData=(data: any)=>{
//       this.selectedNodeData = data;
//     }

//     const setSelectedNodeName = (name?: string, title?: string) =>{
//       if(name){
//         this.selectedNodeName = `{name:'${name}'}`;
//       }
//       if(title){
//         this.selectedNodeName = `{title:'${title}'}`;
//       }
//     }

//     // updateWithCypher用於更輕量級的更新，而不必完全重新渲染整個圖形。
//     // const updateViz = (name?: string, title?: string) =>{
//     //   viz.clearNetwork();
//     //   if(name){
//     //     viz.updateWithCypher(`MATCH (n1{name:'${name}'})-[r${this.computedTypeValue}]->(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`);
//     //   }
//     //   if(title){
//     //     viz.updateWithCypher(`MATCH (n1{title:'${title}'})<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) RETURN r, n1, n2${this.computedLimitCount}`);
//     //   }
//     // }

//     // viz.registerOnEvent('clickRelationship', function (properties: any) {
//     //     console.log(properties);
//     // });

//     const isRemove = () => {
//         return this.removeItem
//     }
//     const removeItem = (nodeId:any) => {
//         viz.clearNetwork();
//         viz.updateWithCypher(`MATCH (n1)<-[r${this.computedTypeValue}]-(n2${this.computedSubValue}) WHERE ID(n1) <> ' + ${nodeId} + ' RETURN r, n1, n2${this.computedLimitCount}`);
//     }

//     this.selectedEdgeData = viz.registerOnEvent('clickEdge', async function (event: any) {
//         console.log(event);
//         // viz.clearNetwork();
//         viz.updateWithFunction(setColor())
//     });
//     const setColor = () => {
//         this.lineColor = "#FF5733"
//     }

//     this.selectedNodeData = viz.registerOnEvent('clickNode', async function (event: any) {
//       if(!isRemove() && event.node){
//       console.log(event);
//       const dataList = Object.keys(event.node.raw.properties).map(item=> ` ${item}:${event.node.raw.properties[item]}`)
//       setSelectedNodeData(dataList);
//     //   updateViz(event.node.raw.properties?.name, event.node.raw.properties?.title);
//     }
//     if(isRemove()){
//         removeItem(event.nodeId);
//     }
//     });
// }

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
