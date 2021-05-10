import { Directive , ElementRef , HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appApplyRemoveClassOnParent]'
})
export class ApplyRemoveClassOnParentDirective {

  constructor(private _el: ElementRef) {
    // console.log(this._el.nativeElement);
  }
  @Input('appApplyRemoveClassOnParent') data: {};

  @HostListener('click', ['$event.target']) onclick(tg) {   // className 'openMenu'

    // console.log(this._el.nativeElement.parentNode, tg.parentNode);

    let pn = this._el.nativeElement.parentNode;

    while (pn.nodeName !== 'LI') {
      pn = pn.parentNode;
      // console.log(pn.nodeName);
    }
    if (pn.classList.contains(this.data['className'])) {
      pn.classList.remove(this.data['className']);
    } else {
      pn.classList.add(this.data['className']);
    }
}

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
    imports: [CommonModule],
    exports: [ApplyRemoveClassOnParentDirective],
    declarations: [ApplyRemoveClassOnParentDirective],
    providers: [],
})
export class ApplyRemoveClassOnParentModule { }
