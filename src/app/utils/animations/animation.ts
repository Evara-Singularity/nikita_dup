import { animate, style, transition, trigger } from "@angular/animations";

export let fade = trigger('fade',[
  transition('void => *',[
    style({
      opacity: 0,
      transform: 'translateY(5px)'
    }),
    animate(600,
    style({

    }))
  ])
]);
