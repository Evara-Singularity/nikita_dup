import { Injectable } from '@angular/core';
import CONSTANTS from '../../config/constants';
import { DataService } from '../../utils/services/data.service';

const URLS = {
    ARTICLE: { 'TYPE': 'GET', URL: CONSTANTS.NEW_MOGLIX_API + '/cmsapi/getLayoutJsonByRequestParam?requestParam=' },
}

@Injectable()
export class ArticleService {
    constructor(private dataService: DataService) { }

    getArticlePageData(name) {
        return this.dataService.callRestful(URLS.ARTICLE.TYPE, URLS.ARTICLE.URL + name);
    }
}
