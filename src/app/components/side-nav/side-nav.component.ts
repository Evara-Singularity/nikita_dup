import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalAuthService } from '../../utils/services/auth.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  @Input() sideMenuOpen: boolean = true;
  reStoreHome: boolean = false;
  user: any = null

  constructor(
    private localStorageService: LocalStorageService,
    private localAuthService: LocalAuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (this.localStorageService.retrieve('tocd')) {
      this.reStoreHome = true;
    } else {
      this.reStoreHome = false;
    }
    this.localStorageService.observe('tocd').subscribe((value) => this.reStoreHome = true);
    this.user = this.localAuthService.getUserSession();
    
  }

  sideMenu() {

    this.sideMenuOpen = !this.sideMenuOpen;
    if (this.sideMenuOpen) {
      this.disableScroll();
      (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
    } else {
      this.enableScroll();
      (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
    }
  }

  disableScroll() {
    document.getElementById('body').addEventListener('touchmove', this.preventDefault, { passive: false });
    document.getElementById('scrolledUl').addEventListener('touchmove', this.propagation, { passive: false });
  }

  enableScroll() {
    document.getElementById('body').removeEventListener('touchmove', this.preventDefault);
  }

  preventDefault(e) {
    e.preventDefault();
  }
  propagation(e) {
    e.stopPropagation();
  }

  reStoreCookie() {
    this.sideMenu();
    this.localStorageService.clear('tocd');
    this.reStoreHome = false;
  }

  redirectProfile() {
    this.router.navigateByUrl('/dashboard/info');
  }

}

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [SideNavComponent]
})
export class SideNavModule { }