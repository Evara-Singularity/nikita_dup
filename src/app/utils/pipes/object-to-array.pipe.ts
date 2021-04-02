import { Pipe, PipeTransform, NgModule } from '@angular/core'
@Pipe({
    name: "objectToArray"
})
export class ObjectToArray implements PipeTransform {
    transform(value: {}, fallback?: string): any {
        if (fallback != undefined && fallback != null && fallback == 'associative') {
            let rArray = [];
            if (value != undefined) {
                let keys = Object.keys(value);
                if (keys.length > 0) {
                    for (let key of keys) {
                        rArray.push({ key: key, value: value[key] });
                    }
                }
            }
            return rArray;
        } else {
            let rArray = [];
            let keys = Object.keys(value);
            if (keys.length > 0) {
                for (let key of keys) {
                    rArray.push(value[key]);
                }
            }
            return rArray;
        }
    }
}

@NgModule({
    declarations: [ObjectToArray],
    exports: [ObjectToArray],
    providers: [
        ObjectToArray,
    ]
})
export class ObjectToArrayPipeModule {
}