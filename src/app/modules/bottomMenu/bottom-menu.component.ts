import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'app-bottom-menu',
    styleUrls: ['./bottom-menu.component.scss'],
    templateUrl: './bottom-menu.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BottomMenuComponent implements OnInit {
    @Input() isRFQPopUp;
    @Input() data: {};
    @Input() containerClasses ;
    @Output() outData$: EventEmitter<{}>;
    @Input() containerClasses: string = "";
    isServer: boolean;
    isBrowser: boolean;
    constructor(public _commonService: CommonService) {
        this.outData$ = new EventEmitter();
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit() {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        setTimeout(() => {
            const el = document.querySelector('app-bottom-menu .bottom-options');
            if (el) {
                el.classList.add('open');
                if (this.isBrowser && document.getElementsByClassName('open').length == 1) {
                    (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
                    this.disableScroll();
                }
            }
        }, 0);
    }
    ngOnDestroy() {
        of(null)
            .pipe(
                delay(200)
            )
            .subscribe(() => {
                if (this.isBrowser && document.getElementsByClassName('open').length === 0) {
                    (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
                    this.enableScroll();
                }
            });
    }
    preventDefault(e) {
        e.preventDefault();
    }
    disableScroll() {
        document.body.addEventListener('touchmove', this.preventDefault, { passive: false });
    }
    enableScroll() {
        document.body.removeEventListener('touchmove', this.preventDefault);
    }
    updateParent(data) {
        document.querySelector('app-bottom-menu .bottom-options').classList.remove('open');
        setTimeout(() => {
            this.outData$.emit(data)
        }, 100);
    }
}
