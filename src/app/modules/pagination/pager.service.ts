import { range } from 'underscore';

export class PagerService {

    getPager(totalItems: number, currentPage: number = 1, pageSize: number = 32) {
        let totalPages = Math.ceil(totalItems / pageSize);    // calculate total pages
        let startPage: number, endPage: number;
        if (totalPages <= 6) {
            startPage = 1;                                    // less than 10 total pages so show all
            endPage = totalPages;
        } else {
            if (currentPage <= 4) {                           // more than 10 total pages so calculate start and end pages
                startPage = 1;
                endPage = 6;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 5;
                endPage = totalPages;
            } else {
                startPage = currentPage - 3;
                endPage = currentPage + 2;
            }
        }
        let startIndex = (currentPage - 1) * pageSize;         // calculate start and end item indexes
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
        let pages = range(startPage, endPage + 1);             // create an array of pages to ng-repeat in the pager control

        return {                                               // return object with all pager properties required by the view
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}