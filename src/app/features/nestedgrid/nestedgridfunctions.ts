import { DetailComponent } from "./childgrid/child.component";

export class NestedGridFunction
{
    constructor(gridComponent : DetailComponent)
    {
        this._gridComponent = gridComponent;
    }
    private _gridComponent : DetailComponent;

   public BuildContextMenuItems() {
        this._gridComponent.gridContextMenuItems = [
          { label: "What's this", disabled: false },
          { label: "Cut", disabled: false },
          { label: "Copy", disabled: false },
          { label: "Paste", disabled: false },
          { label: "Auto Complete(copy first cell)",  disabled: false },
          { label: "Auto Complete(data series)", disabled: false },
          { label: "Free Number Search", disabled: false },
          { label: "Call Up Record", disabled: false },
        ];
        var isMaptable = this._gridComponent.mapdisplay;
        this._gridComponent.gridRowHeaderContextMenuItems = [ 
        { label: "Clone", disabled: false },
        { label: "Delete", disabled: false },
        { label: "GeoEditor", disabled: !(isMaptable) }];
    
      let gridCount : number = 0;
      if(this._gridComponent.gridSettings  && this._gridComponent.gridSettings.state.group != undefined)
        gridCount = this._gridComponent.gridSettings.state.group.length;
      this._gridComponent.getColumnHeaderContextMenuItems = [ 
        { label: "What's this", disabled: false },
        { label: "Add New", disabled: false },
        { label: "Export to Excel", disabled: false },        
        
    ];
      }

}