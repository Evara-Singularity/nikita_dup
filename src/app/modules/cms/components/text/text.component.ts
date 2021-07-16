import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'text',
  templateUrl: './text.component.html',
    styleUrls: ['./text.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TextComponent implements OnInit {
    @Input('customStyle') customStyle;
    @Input('data') data: Array<any> = null
    @Input('title') title: string = '';
    @Input('componentName') componentName;
    info = null;
    titleData = null;
    textDescription; string = null;
    
    constructor(private domsanitizer: DomSanitizer) { }

    ngOnInit() { 
        this.titleData = this.title && this.title['titleName'] ? this.title['titleName'] : null;
        this.initialize(this.data[0]); 
    }

    initialize(info)
    {
        this.info = info;
        this.textDescription = this.domsanitizer.bypassSecurityTrustHtml(info['textDescription']);
    }

}
