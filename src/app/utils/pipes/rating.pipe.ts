import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rating'
})
export class RatingPipe implements PipeTransform {
    transform(rating: number): any {
        if (rating > 0 && rating < 3.5) {
            rating = 3.5;
        } else if (rating == null) {
            rating = 0;
        }
        return rating;
    }
}

@NgModule({
    imports: [],
    exports: [RatingPipe],
    declarations: [RatingPipe],
    providers: [],
})
export class RatingPipeModule { }