import {Directive, ElementRef, HostListener} from '@angular/core';

/**
 * Created by root on 18/5/17.
 */

@Directive({
    selector:'[filterSearchBox]'
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
        // this.nativeElement.style.backgroundColor = 'yellow';
        const filter = this.nativeElement.value.trim().toLowerCase();
        // console.log(this.nativeElement, this.nativeElement.parentNode);
        // console.log(filter, filter.length);
        if (filter.length > 0) {
            // console.log(attrs.searchFor);
            let ulli = [];
            const nextAllUl = this.getNextSiblings(this.nativeElement.parentNode, function(el) {
                // console.log(el, 'getNextSiblings');
                return el.nodeName.toLowerCase() === 'div';
            });

            // console.log(nextAllUl, 'nextAllUl');
            Array.prototype.map.call(nextAllUl, function(el, i) {
                // console.log(el, el.getElementsByTagName('li'), "lilili");
                // ulli.push(el.querySelector('li'));
                ulli = Array.from(el.getElementsByTagName('label'));
            });
            // ulli = $(this.nativeElement).nextAll('ul').find('li');

            // console.log(ulli);

            // console.log(Object.keys(ulli));

            for (const elem of ulli) {
                if (elem === 'length' || elem === 'prevObject' || elem === 'context' || elem === 'selector') {
                    return;
                }
                // console.log(elem);
                const val = elem.innerText;
                // console.log(val, filter);
                if (val.toLowerCase().search(filter) >= 0) {
                    // $(elem).css('padding-top', "15px");
                    elem.style.display = 'block';
                    // $(elem).css('display', "block");
                    // console.log(elem);
                } else {
                    elem.style.display = 'none';
                    // $(elem).css('display', "none");
                }
            }
        } else {
            let ulli = [];
            const nextAllUl = this.getNextSiblings(this.nativeElement.parentNode, function(el) {
                return el.nodeName.toLowerCase() === 'div';
            });
            Array.prototype.map.call(nextAllUl, function(el, i) {
                // ulli.push(el.querySelector('li'));
                ulli = Array.from(el.getElementsByTagName('label'));
            });
            for (const elem of ulli) {
                elem.style.display = 'block';
            }

            /*ulli = ulli = $(this.nativeElement).nextAll('ul').find('li');
            for (let elem of ulli) {
                $(elem).css('display', "block");
            }*/
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
