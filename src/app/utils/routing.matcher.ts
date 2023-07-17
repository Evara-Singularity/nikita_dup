import { Injectable } from "@angular/core";
import { UrlSegment } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export default class RoutingMatcher {
    
    productV1Match(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength == 4) {
            const secondURLStrig = url[2].toString();
            const firstURLString = url[0].toString();
            if (secondURLStrig === 'mp' && firstURLString == 'v1') {
                return { consumed: url, posParams: { msnid: url[3] } };
            }
        }
    }

    productMatch(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength > 2) {
            const secondURLStrig = url[1].toString();
            const firstURLString = url[0].toString();
            if (secondURLStrig === 'mp' && firstURLString !='v1') {
                return { consumed: url, posParams: { msnid: url[2] } };
            }
        }
    }

    productMatchTranslate(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength > 3) {
            const firstURLString = url[0].toString();
            const secondURLStrig = url[2].toString();
            if (firstURLString === 'hi' && secondURLStrig === 'mp') {
                return { consumed: url, posParams: { msnid: url[3] } };
            }
        }
    }

    brandCategoriesMatchTranslater(url: UrlSegment[]): any {
        const urlLength = url.length;
        console.log(url);
        if (urlLength >= 2) {
            const lastParam = url[urlLength - 1].toString();
            const brandParam = url[1].toString();
            const firstParam = url[0].toString();
            if (firstParam === 'hi' && lastParam.match(/^\d{9}$/) && brandParam === 'brands') {
                console.log('brand category hindi')
                return {
                    consumed: url,
                    posParams: { category: url[urlLength - 1], brand: url[2] },
                };
            }
        }
    }

    brandCategoriesMatcher(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength > 0) {
            const lastParam = url[urlLength - 1].toString();
            const brandParam = url[0].toString();
            if (lastParam.match(/^\d{9}$/) && brandParam === 'brands') {
                console.log('brand category english')
                return {
                    consumed: url,
                    posParams: { category: url[urlLength - 1], brand: url[1] },
                };
            }
        }
    }

    categoriesMatchTranslater(url: UrlSegment[]): any {
        const urlLength = url.length;
        if (urlLength >= 2) {
            const lastParam = url[urlLength - 1].toString();
            const brandParam = url[1].toString();
            const firstParam = url[0].toString();
            if (firstParam === 'hi' && lastParam.match(/^\d{9}$/) && brandParam !== 'brands') {
                console.log('category hindi')
                return { consumed: url, posParams: { id: url[urlLength - 1] } };
            }
        }
    }

    categoriesMatcher(url: UrlSegment[]): any {
        console.log(url)
        const urlLength = url.length;
        if (urlLength > 0) {
            const lastParam = url[urlLength - 1].toString();
            const brandParam = url[0].toString();
            if (lastParam.match(/^\d{9}$/) && brandParam !== 'brands' && brandParam !== 'hi') {
                console.log('category english')
                return { consumed: url, posParams: { id: url[urlLength - 1] } };
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