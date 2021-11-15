import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  pageRefreshed = true;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    if (this.pageRefreshed) {
      window.history.replaceState('', '', '/');
      window.history.pushState('', '', this.router.url);
      this.pageRefreshed = false;
    }
  }
}
