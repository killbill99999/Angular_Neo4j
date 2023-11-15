import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { INCREMENT, DECREMENT, RESET } from './counter';

interface AppState {
  selectedNodeList: any[];
}

export interface Action {
  type: string;
}

@Component({
  selector: 'app-my-counter',
  template: `
    <button (click)="increment()">Increment</button>
    <div>Current Count: { { count$ | async } }</div>
    <button (click)="decrement()">Decrement</button>
    <button (click)="reset()">Reset Counter</button>
  `,
})
export class MySelectedNodeListComponent {
  selectedNodeList$: Observable<any[]>;

  constructor(private store: Store<AppState>) {
    this.selectedNodeList$ = store.pipe(select('selectedNodeList'));
  }

  setSelectedNode() {
    this.store.dispatch({ type: INCREMENT })
  }
}
