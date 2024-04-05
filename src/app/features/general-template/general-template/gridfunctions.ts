import { GeneralTemplateComponent } from "./general-template.component";

export class GridFunction
{
    constructor(gridComponent : GeneralTemplateComponent)
    {
        this._gridComponent = gridComponent;
    }
    private _gridComponent : GeneralTemplateComponent;

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
      var isComplexTable = gridCount >0 && !this._gridComponent.ContainsChildTable();
      this._gridComponent.getColumnHeaderContextMenuItems = [ 
        { label: "What's this", disabled: false },
        { label: "Export to Excel", disabled: false },
        { label: "Print", disabled: false },
        { label: "Expand All Groups", disabled: !(isComplexTable)   } ,
        { label: "Collapse All Groups", disabled:  !(isComplexTable) },
        { label: "Toggle Group Panel", disabled: !(isComplexTable) },
        { label: "Toggle Filter Row", disabled: false }, 
    ];
      }

}