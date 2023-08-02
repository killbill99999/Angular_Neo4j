import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title:string = 'myproj-front';
  testNumber:number = 123;

  onClick() {
    this.testNumber = 234536475867;
  }
}
