import { Component, OnInit, Input, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { delay } from 'rxjs/operators';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

@Component({
    selector: 'app-bottom-menu',
    styleUrls: ['./bottom-menu.component.scss'],
    templateUrl: './bottom-menu.component.html'
})
export class BottomMenuComponent implements OnInit {

    @Input() data: {};
    @Output() outData$: EventEmitter<{}>;
    isServer: boolean;
    isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) platformId) {
        this.outData$ = new EventEmitter();
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        setTimeout(()=>{
            document.querySelector('app-bottom-menu .bottom-options').classList.add('open');
            if(this.isBrowser && document.getElementsByClassName('open').length == 1){
                (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
                this.disableScroll();
            }
        },0);
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
    preventDefault(e){
        e.preventDefault();
    }
    disableScroll(){
        document.body.addEventListener('touchmove', this.preventDefault, { passive: false });
    }
    enableScroll(){
        document.body.removeEventListener('touchmove', this.preventDefault);
    }
    updateParent(data){
        document.querySelector('app-bottom-menu .bottom-options').classList.remove('open');
        setTimeout(()=>{
            this.outData$.emit(data)
        }, 100);
    }
}
