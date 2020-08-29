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

export function px (n : number) : string{
    return n.toString() + "px";
}

export function pxToInt(s : string) : number {
    return parseInt(s.replace(/[^\d-]/g, ""));
}

export function getRandom(min:number, max:number) {
    return Math.random() * (max - min) + min;
}

export function shuffle(array : any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }