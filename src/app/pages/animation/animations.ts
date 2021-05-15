import { animate, style, transition, trigger } from "@angular/animations";

export let fade = trigger('fade',[
    transition('void => *',[
        style({
            opacity: 0,
        }),
        animate(600,
            style({
                opacity: 1,
            })
        )
    ])
]);

export let fadeOut = trigger('fadeOut',[
  transition('* => void',[
    style({
      opacity: 1
    }),
    animate(600,
      style({
        opacity: 0,
        transform: 'translateY(15px) scale(0.99)'
      })
    )
  ])
]);
