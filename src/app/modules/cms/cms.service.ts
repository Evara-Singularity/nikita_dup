import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class CmsService {
    constructor(private _router: Router) { }


    navigateTo(link, qp) {
        if (this._router.url !== '/brand-store') {
            qp = {};
        }
        this._router.navigate([link], { queryParams: qp });
    }
}