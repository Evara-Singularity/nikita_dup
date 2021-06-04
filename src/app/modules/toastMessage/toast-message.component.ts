import { Component, OnInit, Input } from '@angular/core';
import { of } from 'rxjs';
import { delay, map, debounceTime, first } from 'rxjs/operators';
import { ToastMessage } from './toast-message.module';
import { ToastMessageService } from './toast-message.service';

@Component({
    selector: 'toast-message',
    templateUrl: './toast-message.component.html',
    styleUrls: ['./toast-message.component.scss']
})
export class ToastMessageComponent implements OnInit {

    @Input() iData: {};
    toasts: Array<ToastMessage>;

    constructor(private _tms: ToastMessageService) {
        this.toasts = [];
    }

    ngOnInit(): void {
        this._tms.getToasts()
        .pipe(
            map(tm => tm),
            first()
        )
        .subscribe((tm: ToastMessage) => {
            // Add Unique id for each toast in array
            this.toasts = [];
            if (this.toasts.length) {
                const tmg = this.toasts[this.toasts.length - 1];
                tm  = Object.assign({}, tm, {key: tmg['key'] + 1});
            } else {
                tm  = Object.assign({}, tm, {key: 1});
            }
            this.toasts.push(tm);
            of(tm)
            .pipe(
                delay(tm['tDelay'] ? tm['tDelay'] : 3000)
            )
            .subscribe((t) => {
                this.toasts.splice(this.toasts.findIndex(toast => t['key'] === toast['key']), 1);
            });
        });
    }
    
}
