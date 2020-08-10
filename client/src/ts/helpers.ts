export function el(e: string) : HTMLElement{
    return <HTMLElement>document.querySelector(e);
}

export function querySelector(query: string, el : HTMLElement | null = null) {
    return el ? el.querySelector<HTMLInputElement>(query) : document.querySelector<HTMLInputElement>(query);
}

export function px (n : number) : string{
    return n.toString() + "px";
}

export function pxToInt(s : string) : number {
    return parseInt(s.replace(/[^\d-]/g, ""));
}