import { Injectable } from '@angular/core';
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
            "@context": "https://schema.org",
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
                    "url": "https://statics.moglix.com/img/newsletter/int/2021/january/210121/moglixhaina_logo.png"
                }
            }
        }
        return JSON.stringify(schemaObj);
    }

    getBreadcrumbSchema(title, articleUrl)
    {
        let schemaObj = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 0, "item": { "@id": "https://www.moglix.com", "name": "Home" } },
                { "@type": "ListItem", "position": 1, "item": { "@id": "#", "name": "Articles" } },
                { "@type": "ListItem", "position": 2, "item": { "@id": articleUrl, "name": title } }
            ]
        }
        return JSON.stringify(schemaObj);
    }
}
