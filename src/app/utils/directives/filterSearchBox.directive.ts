import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[filterSearchBox]'
})
export class FilterSearchBoxDirective {
    private nativeElement;

    constructor(element: ElementRef) {
        this.nativeElement = element.nativeElement;
    }
    private getNextSiblings(el, filter) {
        const siblings = [];
        while (el = el.nextSibling) {
            if (!filter || filter(el)) {
                siblings.push(el);
            }
        }
        return siblings;
    }
    @HostListener('keyup', ['$event']) onKeyDown(e) {
        const filter = this.nativeElement.value.trim().toLowerCase();

        if (filter.length > 0) {
            let ulli = [];
            const nextAllUl = this.getNextSiblings(this.nativeElement.parentNode, function (el) {
                return el.nodeName.toLowerCase() === 'div';
            });

            Array.prototype.map.call(nextAllUl, function (el, i) {
                ulli = Array.from(el.getElementsByTagName('label'));
            });

            for (const elem of ulli) {
                if (elem === 'length' || elem === 'prevObject' || elem === 'context' || elem === 'selector') {
                    return;
                }
                const val = elem.innerText;
                if (val.toLowerCase().search(filter) >= 0) {
                    elem.style.display = 'block';
                } else {
                    elem.style.display = 'none';
                }
            }
        } else {
            let ulli = [];
            const nextAllUl = this.getNextSiblings(this.nativeElement.parentNode, function (el) {
                return el.nodeName.toLowerCase() === 'div';
            });
            Array.prototype.map.call(nextAllUl, function (el, i) {
                ulli = Array.from(el.getElementsByTagName('label'));
            });
            for (const elem of ulli) {
                elem.style.display = 'block';
            }
        }
    }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
    exports: [FilterSearchBoxDirective],
    declarations: [FilterSearchBoxDirective],
    providers: [],
})
export class FilterSearchBoxDirectiveModule { }