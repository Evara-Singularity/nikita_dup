import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { of } from 'rxjs';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-pop-up-variant2',
  templateUrl: './pop-up-variant2.component.html',
  styleUrls: ['./pop-up-variant2.component.scss']
})
export class PopUpVariant2Component implements OnInit, AfterViewInit, OnDestroy {

  @Input() data;
  @Input() headerCustom: any;
  @Output() outData$: EventEmitter<any> = new EventEmitter<any>();
  closeClass: any = "icon-circle-delete";
  paraClass: any = "txt";
  isServer: boolean;
  isBrowser: boolean;
  pClass: string;
  headerText: string = "";
  selector: any;
  constructor(@Inject(PLATFORM_ID) platformId) {
    // this.outData$ = new EventEmitter();
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.pClass = 'screen-view popup info-update-popup ';
  }

  ngOnInit() {
    this.pClass = (this.data && this.data.class) ? this.pClass + this.data.class : this.pClass;
    this.paraClass = (this.data && this.data.paraClass) ? this.data.paraClass : this.paraClass;
    this.closeClass = (this.data && this.data.closeClass) ? this.data.closeClass : this.closeClass;
    this.headerText = (this.data && this.data.headerText) ? this.data.headerText : "";
    this.selector = (this.data && this.data.selector) ? this.data.selector : "";
    this.headerCustom = (this.data && this.data.headerCustom) ? this.data.headerCustom : false;
    if (this.isBrowser) {
      setTimeout(() => {
        document.querySelector('app-pop-up-variant2').classList.add('open');
        if (document.getElementsByClassName('open').length === 1) {
          (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
          this.disableScroll();
        }
        const className = document.getElementsByClassName('content-popup');
        for (let i = 0; i < className.length; i++) {
          className[i].addEventListener('touchmove', this.propagation, false);
        }
      }, 0);
    }
  }

  ngAfterViewInit() {
  }
  preventDefault(e) {
    e.preventDefault();
  }
  propagation(e) {
    e.stopPropagation();
  }
  disableScroll() {
    document.getElementById('body').addEventListener('touchmove', this.preventDefault, { passive: false });
  }
  enableScroll() {
    document.getElementById('body').removeEventListener('touchmove', this.preventDefault);
  }

  closePopup() {
    (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
    this.enableScroll();
    document.querySelector('app-pop-up-variant2').classList.remove('open');
    this.enableScroll();
    setTimeout(() => {
      this.outData$.emit({ hide: true, selector: this.selector });
    }, 200);
  }

  ngOnDestroy() {
    of(null)
      .pipe(
        delay(200)
      )
      .subscribe(() => {
         ;
        if (this.isBrowser && document.getElementsByClassName('open').length === 0) {
          (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
          this.enableScroll();
        }
      });
  }

  outData(data) {
    this.outData$.emit(data);
  }

}
