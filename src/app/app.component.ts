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

  constructor(private _commonService :CommonService,private router: Router) {}

  ngAfterViewInit() {
    if (this._commonService.isBrowser && this.pageRefreshed && window.location.pathname !== '/') {
      window.history.replaceState('', '', '/?back=1');      window.history.pushState('', '', this.router.url);
      this.pageRefreshed = false;
    }
  }
}
