import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { FooterService } from '../../utils/services/footer.service';

@Injectable()
export class ArticleUtilService
{

    constructor(private footerService: FooterService)
    {
    }

    setFooter()
    {
        this.footerService.setFooterObj({ feature: false, terms: true, links: true, popular: false, copyright: true, companyinfo: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }

    setMobileFoooters()
    {
        this.footerService.setMobileFoooters();
    }

    getArticlesSchema(schema)
    {
        let schemaObj = {
            "@context": CONSTANTS.SCHEMA,
            "@type": "Article",
            "headline": schema['metaTitle'],
            "url": schema['url'],
            "image": schema['mainBannerUrl'],
            "datePublished": schema['timeStamp'],
            "author": "Moglix",
            "publisher": {
                "@type": "Organization",
                "name": "Moglix",
                "logo": {
                    "@type": "ImageObject",
                    "url": CONSTANTS.MOGLIX_HAINA_LOGO
                }
            }
        }
        return JSON.stringify(schemaObj);
    }

    getBreadcrumbSchema(title, articleUrl)
    {
        let schemaObj = {
            "@context": CONSTANTS.SCHEMA,
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 0, "item": { "@id": CONSTANTS.PROD, "name": "Home" } },
                { "@type": "ListItem", "position": 1, "item": { "@id": "#", "name": "Articles" } },
                { "@type": "ListItem", "position": 2, "item": { "@id": articleUrl, "name": title } }
            ]
        }
        return JSON.stringify(schemaObj);
    }
}
