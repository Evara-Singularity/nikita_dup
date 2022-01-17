import { Injectable } from "@angular/core";
import { UrlSegment } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export default class RoutingMatcher {
    productMatch(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength > 2) {
            const secondURLStrig = url[1].toString();
            if (secondURLStrig === 'mp') {
                return { consumed: url, posParams: { msnid: url[2] } };
            }
        }
    }

    categoriesMatcher(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength > 0) {
            const lastParam = url[urlLength - 1].toString();
            const brandParam = url[0].toString();
            if (lastParam.match(/^\d{9}$/) && brandParam !== 'brands') {
                return { consumed: url, posParams: { id: url[urlLength - 1] } };
            }
        }
    }

    brandCategoriesMatcher(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength > 0) {
            const lastParam = url[urlLength - 1].toString();
            const brandParam = url[0].toString();
            if (lastParam.match(/^\d{9}$/) && brandParam === 'brands') {
                return {
                    consumed: url,
                    posParams: { category: url[urlLength - 1], brand: url[1] },
                };
            }
        }
    }

    popularProductsMatcher(url: UrlSegment[]): any {
        if (url.length > 1) {
            if (url[0].toString() === 'q') {
                return { consumed: url, posParams: { searchString: url[1] } };
            }
        }
    }
}