import { Pipe, PipeTransform, NgModule } from '@angular/core';
const RUPEE = "₹";
const HYPHEN = "-";
const DISCOUNT = "%";

@Pipe({
    name: "addFilterSymbol"
})
export class AddFilterSymbol implements PipeTransform
{
    constructor() { }
    transform(value:string, name: string): any
    {
        let returnValue = "";
        if(name && value){
            switch (name.toLowerCase().trim()) {
                case 'price': {
                    let values = value.split(HYPHEN);
                    values.forEach((value, index) => { 
                        values[index] = ((value.trim() !== '*') ? RUPEE + value.trim() : value.trim()) 
                    });
                    returnValue = values.join(" - ");
                    break;
                }
                case 'discount': {
                    let numericValue = parseInt(value).toString();
                    returnValue = value.replace(numericValue, numericValue + "% or more");
                    break;
                }
                default:{
                    returnValue = value;
                }
            }
        }
        return returnValue;
    }
}

@NgModule(
    {
        declarations: [AddFilterSymbol],
        exports: [AddFilterSymbol],
        providers: [
            AddFilterSymbol,
        ]
    }
)

export class AddFilterSymbolPipeModule{}