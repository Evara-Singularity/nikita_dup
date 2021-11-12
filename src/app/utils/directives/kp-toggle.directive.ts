import { Directive, ElementRef, HostListener, Input } from '@angular/core';
@Directive({
    selector: '[appKpToggle]'
})
export class KpToggleDirective {

    constructor(private _el: ElementRef) {
    }

    @Input('appKpToggle') data: {};
    @Input('closeOtherTabs') closeOtherTabs: boolean;

    @HostListener('click') onMouseEnter() {
        if (this.data['iconMode']) {
            this.showContainer(this.data['idName'], true);
        }
        else {
            this.showContainer(this.data['idName'], false);
        }
    }

    resetClass() {
        const panel_body = document.getElementsByClassName('panel-body');
        const panel_head = document.getElementsByClassName('heading-3');

        [].forEach.call(panel_body, (eachHtmlEl) => {
            eachHtmlEl.style.display = 'none';
        });

        [].forEach.call(panel_head, (eachHtmlEl) => {
            eachHtmlEl.classList.remove('ico-up');
            eachHtmlEl.classList.remove('ico-expand');
        });
    }

    showContainer(Id?: string, icon?: boolean) {
        if (this.closeOtherTabs) {
            this.resetClass();
        }
        setTimeout(() => {
            if (document.getElementById(Id).style.display == 'none') {
                document.getElementById(Id).style.display = 'block';
                if (icon == true) {
                    this._el.nativeElement.classList.add('ico-expand');
                    this._el.nativeElement.classList.add('ico-up');
                }
            }
            else {
                document.getElementById(Id).style.display = 'none';
                if (icon == true) {
                    this._el.nativeElement.classList.remove('ico-expand');
                    this._el.nativeElement.classList.remove('ico-up');
                }
            }
        }, 0);
    }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
    declarations: [KpToggleDirective],
    imports: [
        CommonModule
    ],
    exports: [KpToggleDirective],
})
export class KpToggleDirectiveModule { }
