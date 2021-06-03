import { Directive, ElementRef, AfterViewInit, HostListener, Input } from '@angular/core';
@Directive({
    selector: '[appKpToggle]'
})
export class KpToggleDirective implements AfterViewInit {

    constructor(private _el: ElementRef) {
    }

    @Input('appKpToggle') data: {};

    @HostListener('click') onMouseEnter() {
        if (this.data['iconMode']) {
            this.showContainer(this.data['idName'], true);
        }
        else {
            this.showContainer(this.data['idName'], false);
        }
    }

    ngAfterViewInit(): void {
    }

    showContainer(Id?: string, icon?: boolean) {
        if (document.getElementById(Id).style.display == 'none') {
            document.getElementById(Id).style.display = 'block';
            if (icon == true) {
                this._el.nativeElement.classList.add('ico-expand');
                this._el.nativeElement.classList.remove('ico-up');
            }
        }
        else {
            document.getElementById(Id).style.display = 'none';
            if (icon == true) {
                this._el.nativeElement.classList.remove('ico-expand');
                this._el.nativeElement.classList.add('ico-up');
            }
        }
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
