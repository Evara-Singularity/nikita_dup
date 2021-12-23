import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({    name: "brandName"})
export class BrandName implements PipeTransform
{
    transform(brandName: string): any
    {
        let returnValue = "";
        if (brandName && brandName.includes(":"))
        {
            returnValue = (brandName.split(":")[1] as string).trim();
            if (returnValue && returnValue.includes("||"))
            {
                returnValue = returnValue.split('||')[0];
            }
        }
        return returnValue;
    }
}

@NgModule(
    {
        declarations: [BrandName],
        exports: [BrandName],
        providers: [BrandName,]
    }
)

export class BrandNamePipeModule { }