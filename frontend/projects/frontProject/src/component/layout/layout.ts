import { Component } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: '風險總覽',
    children: [{name: '監控指標'}, {name: '告警資訊'}, {name: '平台告知'}, {name: '負面新聞'}],
  },
  {
    name: '客戶風險',
    children: [{name: '客戶查詢'},{name: '可疑行為',},],
  },
  {
    name: '關係風險',
    children: [{name: '個人關聯圖'}],
  },
  {
    name: '態樣風險',
    children: [{name: '數位登入'}],
  },
  {
    name: '風險通報',
    children: [{name: '可疑交易'}, {name: '個別交易'}, {name: '名單資訊'}],
  },
  {
    name: '平台管理',
    children: [{name: '權限審核'}, {name: '授權紀錄'}, {name: '通知管理'}, {name: '名單管理'}],
  },
  {
    name: '個人資訊',
    children: [{name: '權限資訊'}, {name: '名單查詢紀錄'}, {name: '下載紀錄'}, {name: '使用時間紀錄'}],
  },
  {
    name: '系統管理',
    children: [{name: '帳號管理'}, {name: '角色管理'}, {name: '菜單管理'}],
  }
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-layout-component',
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule, RouterModule],
})

export class Layout {
  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}
