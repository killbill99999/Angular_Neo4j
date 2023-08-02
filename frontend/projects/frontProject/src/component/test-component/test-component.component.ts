import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-component',
  // 修改為 template
  template: '<p>Use Template by Component Decorator</p>',
  styleUrls: ['./test-component.component.css']
})
export class TestComponentComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
