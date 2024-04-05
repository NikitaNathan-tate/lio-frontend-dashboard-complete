import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserActivityLog } from './useractivitylog';

@Component({
  selector: 'app-useractivitylog',
  templateUrl: './useractivitylog.component.html',
  styleUrls: ['./useractivitylog.component.scss'],
})
export class UseractivitylogComponent implements OnInit {
  @Input() userActivityLog?: UserActivityLog[]=[];

  constructor(private router: Router) {}
  OpenContextMenu() {
    alert('Yet to implement');
  }

  goToPage(pageName: string) {
    this.router.navigate([`${pageName}`]);
  }

  public ngOnInit(): void {

  }
}
