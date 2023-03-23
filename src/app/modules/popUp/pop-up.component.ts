import { delay } from 'rxjs/operators';
import { Component, ViewEncapsulation, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy, SimpleChanges } from '@angular/core';
import { of } from 'rxjs';
import { CommonService } from '@app/utils/services/common.service';
import { ActivatedRoute, Router } from "@angular/router";


@Component({
    selector: 'app-pop-up',
    templateUrl: './pop-up.component.html',
    styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent implements OnInit, AfterViewInit, OnDestroy {
    emitClick() {
        this.outData$.emit()
    }

    @Input() data;
    @Input('headerType') headerType: any;
    @Input('headerSubText') headerSubText: any;
    @Output() outData$: EventEmitter<any> = new EventEmitter<any>();
    @Input('popUpName') popUpName: string;

    // closeClass: any = "icon-circle-delete";
    // paraClass: any = "txt";
    isServer: boolean;
    isBrowser: boolean;
    pClass: string;
    headerText: string = "";
    selector: any;

    constructor(public _commonService: CommonService,private route: ActivatedRoute, private router: Router ) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
        this.pClass = 'screen-view popup info-update-popup ';
    }

    ngOnInit() {
        // this.pClass = (this.data && this.data.class) ? this.pClass + this.data.class : this.pClass;
        // this.paraClass = (this.data && this.data.paraClass) ? this.data.paraClass : this.paraClass;
        // this.closeClass = (this.data && this.data.closeClass) ? this.data.closeClass : this.closeClass;
        this.headerText = (this.data && this.data.headerText) ? this.data.headerText : "";
        this.headerSubText=(this.data && this.data.headerSubText) ? this.data.headerSubText : "";
        this.selector = (this.data && this.data.selector) ? this.data.selector : "";
        // this.headerCustom = (this.data && this.data.headerCustom) ? this.data.headerCustom : false;
        if (this.isBrowser) {
            setTimeout(() => {
                // debugger;
                document.querySelector('app-pop-up').classList.add('open');
                if (document.querySelector('app-pop-up').classList.contains('open')) {
                    (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
                    this.disableScroll();
                }
                const className = document.getElementsByClassName('content-popup');
                for (let i = 0; i < className.length; i++) {
                    className[i].addEventListener('touchmove', this.propagation, { passive: true });
                }
            }, 0);
        }
        // console.log(this.headerCustom,"this.headerText");
        // console.log(this.headerText,"this.headerText");
    }

    ngOnChanges(changes: SimpleChanges) {
        this.headerText = (changes && changes['data'] && changes['data']['currentValue'] && changes['data']['currentValue']['headerText'])? changes['data']['currentValue']['headerText'] : "";
        this.headerSubText = (changes && changes['data'] && changes['data']['currentValue'] && changes['data']['currentValue']['headerSubText'])? changes['data']['currentValue']['headerSubText'] : "";
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
        this._commonService.setBodyScroll(null, false);
    }
    enableScroll() {
        this._commonService.setBodyScroll(null, true);
    }
    closePopup() {
        (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
        this.enableScroll();
        document.querySelector('app-pop-up').classList.remove('open');
        this.enableScroll();
        setTimeout(() => {
            let currentUrl=this._commonService.currentUrl;
            if(currentUrl.split('#').length > 1){
                this.router.navigate([currentUrl.split('#')[0]]) // remove fragment
            }else{
                this.outData$.emit({ hide: true, selector: this.selector });
            }
            // console.log('curentURL', currentUrl);
        }, 200);
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

    outData(data) {
        this.outData$.emit(data);
    }
}
