import { NgModule, Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'otpTimer' })
export class OTPTimerPipe implements PipeTransform
{
    transform(time: number): any
    {
        if (time)
            return time > 9 ? `00:${time}` : `00:0${time}`;
        return "00:00";
    }
}

@NgModule({
    imports: [],
    exports: [OTPTimerPipe],
    declarations: [OTPTimerPipe],
    providers: [],
})
export class OTPTimerPipeModule { }