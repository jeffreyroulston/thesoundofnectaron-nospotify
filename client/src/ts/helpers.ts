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