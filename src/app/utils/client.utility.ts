function getHeight(el) {
    if(!el){
        return 0;
    }
    let el_style      = window.getComputedStyle(el),
        el_display    = el_style.display,
        el_position   = el_style.position,
        el_visibility = el_style.visibility,
        el_max_height = el_style.maxHeight.replace('px', '').replace('%', ''),

        wanted_height = 0;


    // if its not hidden we just return normal height
    if(el_display !== 'none' && el_max_height !== '0') {
        return el.offsetHeight;
    }

    // the element is hidden so:
    // making the el block so we can meassure its height but still be hidden
    el.style.position   = 'absolute';
    el.style.visibility = 'hidden';
    el.style.display    = 'block';

    wanted_height     = el.offsetHeight;

    // reverting to the original values
    el.style.display    = el_display;
    el.style.position   = el_position;
    el.style.visibility = el_visibility;

    return wanted_height;
}
export const ClientUtility = {
    POPUP:{
        toggle: function(div_id) {
            let el = document.getElementById(div_id);
            if(!el){
                return;
            }
            if ( el.style.display == 'none' ) { 
                el.style.display = 'block';
                if(div_id==='oosModal' || div_id==='offerModel' || div_id==='emiModal' || div_id==='myModal'){
                    setTimeout(()=>{
                        el.classList.add("open_model");
                    },100);
                }
                document.body.classList.add('modal-open');
            } else {
                if(el.classList.contains('open_model')){
                    el.classList.remove("open_model");
                    setTimeout(()=>{
                        el.style.display = 'none';
                    },500);
                }else{
                    el.style.display = 'none';
                }
                document.body.classList.remove('modal-open');
            }
        }
    },
    FX: {
        easing: {
            linear: function(progress) {
                return progress;
            },
            quadratic: function(progress) {
                return Math.pow(progress, 2);
            },
            swing: function(progress) {
                return 0.5 - Math.cos(progress * Math.PI) / 2;
            },
            circ: function(progress) {
                return 1 - Math.sin(Math.acos(progress));
            },
            back: function(progress, x) {
                return Math.pow(progress, 2) * ((x + 1) * progress - x);
            },
            bounce: function(progress) {
                for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
                    if (progress >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
                    }
                }
                return null;
            },
            elastic: function(progress, x) {
                return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
            }
        },
        animate: function(options) {
            let start = new Date();
            let id = setInterval(function() {
                let timePassed = new Date().getTime() - start.getTime();
                let progress = timePassed / options.duration;
                if (progress > 1) {
                    progress = 1;
                }
                options.progress = progress;
                let delta = options.delta(progress);
                options.step(delta);
                if (progress == 1) {
                    clearInterval(id);
                    options.complete();
                }
            }, options.delay || 10);
        },
        fadeOut: function(element, options) {
            let to = 1;
            this.animate({
                duration: options.duration,
                delta: (progress) => {
                    progress = this.progress;
                    return this.easing.swing(progress);
                },
                complete: options.complete,
                step: function(delta) {
                    element.style.opacity = to - delta;
                }
            });
        },
        fadeIn: function(element, options) {
            let to = 0;
            this.animate({
                duration: options.duration,
                delta: (progress) => {
                    progress = this.progress;
                    return this.easing.swing(progress);
                },
                complete: options.complete,
                step: function(delta) {
                    element.style.opacity = to + delta;
                }
            });
        }
    },
    scrollToTop: function(duration, to?) {
        if(!to){
            to = 0;
        }
        const
        element = document.scrollingElement || document.documentElement,
        start = element.scrollTop,
        change = to - start,
        startDate = +new Date(),
        // t = current time
        // b = start value
        // c = change in value
        // d = duration
        easeInOutQuad = function(t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        },
        animateScroll = function() {
            const currentDate = +new Date();
            const currentTime = currentDate - startDate;
            element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
            if(currentTime < duration) {
                requestAnimationFrame(animateScroll);
            }
            else {
                element.scrollTop = to;
            }
        };
        animateScroll();
    },
    fadeOut:function(el){
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = "none";
            } else {
                requestAnimationFrame(fade);
            }
        })();
    },
    // fade in  
    fadeIn: function(el, display?){
        el.style.opacity = 0;
        el.style.display = display || "block";
        (function fade() {
            let val = parseFloat(el.style.opacity);
            if (!((val += .1) > 1)) {
                el.style.opacity = val;
                requestAnimationFrame(fade);
            }
        })();
    },
    /**
    * toggleSlide mimics the jQuery version of slideDown and slideUp
    * all in one function comparing the max-heigth to 0
    */
    slideToggle: function(el) {
        if(!el){
            return;
        }
        let el_max_height = '0';
        if(el.getAttribute('data-max-height')) {
            // we've already used this before, so everything is setup
            if(el.style.maxHeight.replace('px', '').replace('%', '') === '0') {
                el.style.maxHeight = el.getAttribute('data-max-height');
            } else {
                el.style.maxHeight = '0';
            }
        } else {
            el_max_height                  = getHeight(el) + 'px';
            el.style['transition']         = 'max-height 0.5s ease-in-out';
            el.style.overflowY             = 'hidden';
            el.style.maxHeight             = '0';
            el.setAttribute('data-max-height', el_max_height);
            el.style.display               = 'block';

            // we use setTimeout to modify maxHeight later than display (to we have the transition effect)
            if(el_max_height != el.style.maxHeight){
                setTimeout(function() {
                    el.style.maxHeight = el_max_height;
                }, 10);
            }
        }
    },
    collectionHas: function(a, b) { //helper function (see below)
        for(let i = 0, len = a.length; i < len; i ++) {
            if(a[i] == b) return true;
        }
        return false;
    },
    parent: function(elm, selector) {
        if(!elm){
            return document.body;
        }
        if(!selector){
            return elm.parentNode;
        }
        let all = document.querySelectorAll(selector);
        let cur = elm.parentNode;
        while(cur && !this.collectionHas(all, cur)) { //keep going up until you find a match
            cur = cur.parentNode; //go up
        }
        return cur; //will return null if not found
    },
    getSiblings: function(el, filter?) {
        if(!el){
            return [];
        }
        let siblings = [];
        el = el.parentNode.firstChild;
        do { if (!filter || filter(el)) siblings.push(el); } while (el = el.nextSibling);
        return siblings;
    },
    outerHeight: function(el, includeMargin?) {
        if(!el){
            return 0;
        }
        let height = el.offsetHeight;
        if(!includeMargin){
            return height;
        }
        let style = getComputedStyle(el);
        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    },
    outerWidth: function(el, includeMargin?) {
        if(!el){
            return 0;
        }
        let width = el.offsetWidth;
        if(!includeMargin){
            return width;
        }
        let style = getComputedStyle(el);
        width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        return width;
    },
    offset: function( el ) {
		let rect, win, elem = el;
		if ( !elem ) {
			return null;
		}
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	}
};