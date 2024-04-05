import { Component, ContentChild, EventEmitter, Input, Output, OnDestroy, Renderer2, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'childgrid-context-menu',
    template: `
        <kendo-popup *ngIf="show" [offset]="offset" >
            <ul class="childmenu">
              <li style="height:2rem;font-size:10px;" *ngFor="let item of childmenuItems" (click)="childmenuItemSelected(item)" [ngClass]="{ 'disabled-item': item.disabled }">
                <ng-template *ngIf="childmenuItemTemplate" [ngTemplateOutlet]="childmenuItemTemplate"
                    [ngTemplateOutletContext]="{ item: item, dataItem: dataItem }">
                </ng-template>
                <ng-container *ngIf="!childmenuItemTemplate">
                    {{ item.label }}
                </ng-container>
              </li>
            </ul>
        </kendo-popup>
    `,
    styles: [`
     .childmenu {
        list-style:none;
        margin: 0;
        padding: 0;
        cursor: pointer;
      }

      .childmenu li {
        border-bottom: 1px solid rgba(0,0,0,.08);
        padding: 8px 12px;
        transition: background .2s, color .2s;
      }

      .childmenu li:last-child {
        border-bottom: 0;
      }

      .childmenu li:hover {
        background: #e8e8e8;
      }

      .childmenu li:active {
        background: #ff6358;
        color: #fff;
      }
    `]
})
export class ChildGridContextMenuComponent implements OnDestroy {

    @ContentChild(TemplateRef)
    public childmenuItemTemplate: TemplateRef<any>;

    @Input()
    public childmenuItems: any[] = [];
    @Input()
    getRowNumberContextMenuItemsChild: any[] = [];
    @Input()
    generalContextMenuItemsChild: any[] = [];
    @Input()
    public rowMenuChild: boolean = false ;
    @Input()
    generalContextMenuItemsChild1: any[] = [];
    @Output()
    public selectChild: EventEmitter<any> = new EventEmitter<any>();
    private headerContextMenuListener: () => void;
    @Input()
    getColumnHeaderContextMenuItemsChild: any[] = [];
    @Input()
    getTableHeaderContextMenuItemsChild: any[] = [];
    @Input() public set for(grid: GridComponent) {
        this.unsubscribe();
        this.cellClickSubscription = grid.cellClick.subscribe(this.onCellClick);
       // this.headerClickSubscription =  grid.header.click.subscribe(this.onCellClick);

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
          const headerCell = target.closest('.headerCustomClass') as HTMLElement;
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
        this.childmenuItems = this.getColumnHeaderContextMenuItemsChild;
      } 
    }
    public ngOnDestroy(): void {
        this.unsubscribe();
        this.documentClickSubscription();
    }

    public childmenuItemSelected(item: any): void {
        this.selectChild.emit({ item: item, dataItem: this.dataItem });
    }

    private onCellClick({ dataItem, type, originalEvent,column }): void {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
      if (type === 'contextmenu') {
        if(column.title == '')
        this.childmenuItems  = this.getRowNumberContextMenuItemsChild;
        else 
        this.childmenuItems  = this.generalContextMenuItemsChild;

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
