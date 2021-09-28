import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FooterService {
    public footerobj = {
        footerData: false,
    };
    footerChangeSubject: Subject<any> = new Subject<any>();

    setMobileFoooters() {
        this.footerobj['footerData'] = false;
        this.footerChangeSubject.next(this.footerobj);
    }

    setFooterObj(data) {
        Object.assign(this.footerobj, data);
    }
    getFooterObj() {
        return this.footerobj;
    }
}
