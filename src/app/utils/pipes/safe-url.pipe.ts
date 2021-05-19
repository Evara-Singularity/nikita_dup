import { Pipe, PipeTransform, NgModule } from '@angular/core'
import { DomSanitizer } from "@angular/platform-browser";
@Pipe({
    name: "safeUrl"
})
export class SafeUrl implements PipeTransform {
    constructor(private _domSanitizer: DomSanitizer) {

    }
    transform(value: string, fallback?: string): any {
        if (fallback && fallback == 'trustHtml')
            return this._domSanitizer.bypassSecurityTrustHtml(value);
        else
            return this._domSanitizer.bypassSecurityTrustResourceUrl(value);
    }
}

@NgModule(
    {
        declarations: [SafeUrl],
        exports: [SafeUrl],
        providers: [
            SafeUrl,
        ]
    }
)

export class SafeUrlPipeModule {}