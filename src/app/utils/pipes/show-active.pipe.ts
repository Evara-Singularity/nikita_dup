import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({
    name: "showActive"
})
export class ShowActive implements PipeTransform {
    transform(value: {}): any {
        let rArray = [];
        if (value != undefined) {
            let keys = Object.keys(value);
            if (keys.length > 0) {
                for (let key of keys) {
                    if (value[key]["active"] == true) {
                        rArray.push(value[key]);
                    }
                }
            }
        }
        return rArray;
    }
}

@NgModule(
    {
        declarations: [ShowActive],
        exports: [ShowActive],
        providers: [
            ShowActive,
        ]
    }
)

export class ShowActivePipeModule { }