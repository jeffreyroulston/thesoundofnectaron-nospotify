export interface HEX_COLOR {
    r: number,
    g : number,
    b : number
}

export function elByID(e: string) : HTMLElement {
    return <HTMLElement>document.getElementById(e);
}

export function el(e: string) : HTMLElement{
    return <HTMLElement>document.querySelector(e);
}

export function find(el : HTMLElement, e: string) {
    return <HTMLElement>el.querySelector(e);
}

export function elList(e: string) {
    var elements : HTMLElement[] = [];
    document.querySelectorAll(e).forEach(el => {
        elements.push(<HTMLElement>el)
    });
    return elements; 
}

export function findAll(el : HTMLElement, e: string) {
    var elements : HTMLElement[] = [];
    el.querySelectorAll(e).forEach(el => {
        elements.push(<HTMLElement>el)
    });
    return elements; 
}

export function getStyle(el : HTMLElement, prop: string) {
    return window.getComputedStyle(el).getPropertyValue(prop)
}

export function px (n : number) : string{
    return n.toString() + "px";
}

export function pxToInt(s : string) : number {
    return parseInt(s.replace(/[^\d-]/g, ""));
}

export function getRandom(min:number, max:number) {
    return Math.random() * (max - min) + min;
}

export function getRandomInt(min:number, max:number) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(array : any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

export function convertHexToRgb(hex : string) : HEX_COLOR{
    var match = <RegExpMatchArray>hex.replace(/#/,'').match(/.{1,2}/g);
    return {
        r: parseInt(match[0], 16),
        g: parseInt(match[1], 16),
        b: parseInt(match[2], 16)
    }
}

export function findColorBetween(left : HEX_COLOR, right : HEX_COLOR, percentage : number) {
    return {
        r: Math.round(left.r + (right.r - left.r) * percentage / 100),
        g: Math.round(left.g + (right.g - left.g) * percentage / 100),
        b: Math.round(left.b + (right.b - left.b) * percentage / 100),
    }
}

export function rgb(hex: HEX_COLOR) {
    return "rgb(" + hex.r.toString() + "," + hex.g.toString() + "," + hex.b.toString() + ")";
}
