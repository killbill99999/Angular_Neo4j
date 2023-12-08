import {Component, AfterViewInit} from '@angular/core';
import { network } from 'vis-network';
// import * as vis from 'vis-network';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

@Component({
  selector: 'app-dashboard-background',
  templateUrl: './dashboard-background.component.html',
  styleUrls: ['./dashboard-background.component.css']
})
export class DashboardBackgroundComponent implements AfterViewInit{
    ngAfterViewInit() {
        this.draw();
      };

    groups = {} // 預設group 

    groupName: string = ''; // 當前選取的節點的所屬group
    
    /** 設定nodes的dataSet的chosen
     *  return chosen所需的function
     * */
    setGroup = (groupname: string)=>{
        return {
            node: (v:any) => {
                this.groupName = groupname;
                console.log(v);
            },
            label: true,
        } 
    }

       nodes = new DataSet([
        { id: 1, label: 'Node 1', group: 'diamonds', title: 'I have a popup!', chosen: this.setGroup('diamonds')},
        { id: 2, label: 'Node 2', group: 'diamonds', title: 'I have a popup!', chosen: this.setGroup('diamonds') },
        { id: 3, label: 'Node 3', group: 'one', title: 'I have a popup!', chosen: this.setGroup('one') },
        { id: 4, label: 'Node 4', group: 'one', title: 'I have a popup!', chosen: this.setGroup('one')  },
        { id: 5, label: 'Node 5', group: 'two', title: 'I have a popup!', chosen: this.setGroup('two') },
        { id: 6, label: 'Node 6', group: 'two', title: 'I have a popup!', chosen: this.setGroup('two') },
      ] as any);
      
      edges = new DataSet([
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
      ] as any);
    
      draw(){
        var container = document.getElementById("mynetwork") as any;
        var data = {
            nodes: this.nodes,
            edges: this.edges,
        } as any;
        var options = {
            interaction: { hover: true },
            groups: this.groups,
            // nodes: {
            //     chosen: {
            //         // chosen可以抓取到node的id和樣式
            //         node: function(values: any,
            //             id: any,
            //             selected: boolean,
            //             hovered: boolean){
            //             console.log(values, id, selected, hovered);
            //             console.log(network.getConnectedNodes(id));
            //         },
            //         label: true,
            //     }
            // },
            manipulation: {
                addEdge: true,
                deleteNode: true,
                controlNodeStyle: {
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
            }
        } as any;
        var network = new Network(container, data, options);

        // 修改樣式 this.groupName為當前選的節點的group
        var change = () =>{
            options.groups[this.groupName] =  {
                color: { background: "red", border: "white" },
                shape: "diamond",
              }
            network.setOptions(options);
        }

        // 由外部元件或Dom 修改vis
        var changeColor = document.getElementById('colorChange');
        if(changeColor){
        changeColor.onclick = function(){
            change();
        }}

        // 內部點擊節點
        network.on( 'click', (properties) => {
            console.log(properties, properties.nodes);

            // 模擬api回傳資料，並更新vis
            // network.setData({
            //     nodes: [{ id: 1, label: 'Node 1', group: 'diamonds' }, { id: 2, label: 'Node 2', group: 0 }],
            //     edges: [{ from: 1, to: 2 }],
            // } as any);
            // this.editGroup();

            // 內部點擊節點修改樣式
            // change();
        });

        // Popup
        network.on( 'showPopup', function(params) {
            console.log(params);
            var popup = document.getElementById('root') as any;
            popup.innerHTML = '<h2>showPopup event</h2>'+ JSON.stringify(params, null, 4);
        });

        // 節點hover
        network.on("hoverNode", function(){
            // functionality for popup to show on mouseover
          });
      }
}

