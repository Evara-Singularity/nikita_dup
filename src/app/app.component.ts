import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from './utils/services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  pageRefreshed = true;

  constructor(private router: Router, private _commonService: CommonService) {}

  ngAfterViewInit() {
    if (this.pageRefreshed && this._commonService.isBrowser && window) {
      window.history.replaceState('', '', '/');
      window.history.pushState('', '', this.router.url);
      this.pageRefreshed = false;
    }
  }
}
