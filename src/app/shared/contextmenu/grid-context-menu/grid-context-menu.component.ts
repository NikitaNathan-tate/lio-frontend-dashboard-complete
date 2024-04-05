import { Component, ContentChild, EventEmitter, Input, Output, OnDestroy, Renderer2, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'grid-context-menu',
    template: `
        <kendo-popup *ngIf="show" [offset]="offset" >
        <div class="menu" *ngFor="let item of menuItems" (click)="menuItemSelected(item)" [ngClass]="{ 'disabled-item': item.disabled }">
  <ng-template *ngIf="menuItemTemplate" [ngTemplateOutlet]="menuItemTemplate" [ngTemplateOutletContext]="{ item: item, dataItem: dataItem }"></ng-template>
  <ng-container *ngIf="!menuItemTemplate">{{ item.label }}</ng-container>
</div>
        </kendo-popup>
    `,
    styles: [`
    .menu {
  margin: 0;
  padding: 0;
  cursor: pointer;
  border-bottom:  1px solid rgba(0, 0, 0, .08);
  padding: 4px  6px;
  transition: background .2s, color .2s;
  font-size: 10px;
}

.menu:hover {
  background: #e8e8e8;
}

.menu:active {
  background: #ff6358;
  color: #fff;
}

    `]
})
export class GridContextMenuComponent implements OnDestroy {

    @ContentChild(TemplateRef)
    public menuItemTemplate: TemplateRef<any>;

    @Input()
    public menuItems: any[] = [];
    @Input()
    getRowNumberContextMenuItems: any[] = [];
    @Input()
    generalContextMenuItems: any[] = [];
    @Input()
    public rowMenu: boolean = false ;
    @Input()
    generalContextMenuItems1: any[] = [];
    @Output()
    public select: EventEmitter<any> = new EventEmitter<any>();
    private headerContextMenuListener: () => void;
    @Input()
    getColumnHeaderContextMenuItems: any[] = [];
    @Input()
    getTableHeaderContextMenuItems: any[] = [];
    @Input() public set for(grid: GridComponent) {
        this.unsubscribe();
        this.cellClickSubscription = grid.cellClick.subscribe(this.onCellClick);
        if(grid.header != undefined)
       this.headerClickSubscription =  grid.header.click.subscribe(this.onCellClick);

    }

    public show: boolean;
    public dataItem: any;
    public offset: any;

    private cellClickSubscription: Subscription;
    private headerClickSubscription: Subscription;

    private documentClickSubscription: any;

    constructor(private renderer: Renderer2) {
         this.onCellClick = this.onCellClick.bind(this);
        this.documentClickSubscription = this.renderer.listen('document', 'click', () => {
            this.show = false;
        });
        this.headerContextMenuListener = this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const headerCell = target.closest('.headerGeneralClass') as HTMLElement;
          if (headerCell) {
            event.preventDefault();
            this.show = true;
            this.handleHeaderContextMenu(headerCell);
            this.offset = { left: event.pageX, top: event.pageY };
          }
        });
    }
    private handleHeaderContextMenu(headerCell: HTMLElement): void {
      if (headerCell.innerText === '') {
        this.menuItems = this.getColumnHeaderContextMenuItems;
      } 
    }
    public ngOnDestroy(): void {
        this.unsubscribe();
        this.documentClickSubscription();
    }

    public menuItemSelected(item: any): void {
        this.select.emit({ item: item, dataItem: this.dataItem });
    }

    private onCellClick({ dataItem, type, originalEvent,column }): void {
      if (type === 'contextmenu') {
        if(column.title == '')
        this.menuItems  = this.getRowNumberContextMenuItems;
        else 
        this.menuItems  = this.generalContextMenuItems;

        originalEvent.preventDefault();
        this.dataItem = dataItem;
        this.show = true;
        this.offset = { left: originalEvent.pageX, top: originalEvent.pageY };
      }
    }

    private unsubscribe(): void {
        if (this.cellClickSubscription) {
            this.cellClickSubscription.unsubscribe();
            this.cellClickSubscription = null;
        }
    }

}
