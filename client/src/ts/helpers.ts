export interface HEX_COLOR {
    r: number,
    g : number,
    b : number
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

// Color = function(hexOrObject) {
//     var obj;
//     if (hexOrObject instanceof Object) {
//         obj = hexOrObject;
//     } else {
//         obj = LinearColorInterpolator.convertHexToRgb(hexOrObject);
//     }
//     this.r = obj.r;
//     this.g = obj.g;
//     this.b = obj.b;
// }
// Color.prototype.asRgbCss = function() {
//     return "rgb("+this.r+", "+this.g+", "+this.b+")";
// }

export function convertHexToRgb(hex : string) : HEX_COLOR{
    var match = <RegExpMatchArray>hex.replace(/#/,'').match(/.{1,2}/g);
    console.log(hex);
    console.log(match);

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
    
    // var newColor = {};
    // var components = ["r", "g", "b"];
    // for (var i = 0; i < components.length; i++) {
    //     let c = components[i];
    //     newColor[c] = Math.round(left[c] + (right[c] - left[c]) * percentage / 100);
    // }
    // return new Color(newColor);
}

export function rgb(hex: HEX_COLOR) {
    return "rgb(" + hex.r.toString() + "," + hex.g.toString() + "," + hex.b.toString() + ")";
}

var c0 = convertHexToRgb("faeb2f");
var c1 = convertHexToRgb("281333");
console.log(findColorBetween(c0, c1, 0))
console.log(findColorBetween(c0, c1, 20))
console.log(findColorBetween(c0, c1, 40))
console.log(findColorBetween(c0, c1, 60))
console.log(findColorBetween(c0, c1, 80))
console.log(findColorBetween(c0, c1, 100))


// function match(hex : string) {
//     hex.replace(/#/,'').match(/.{1,2}/g);
// }
// 
 
// var LinearColorInterpolator = {
//     // convert 6-digit hex to rgb components;
//     // accepts with or without hash ("335577" or "#335577")
//     convertHexToRgb: function(hex) {
//         match = hex.replace(/#/,'').match(/.{1,2}/g);
//         return new Color({
//             r: parseInt(match[0], 16),
//             g: parseInt(match[1], 16),
//             b: parseInt(match[2], 16)
//         });
//     },
//     // left and right are colors that you're aiming to find
//     // a color between. Percentage (0-100) indicates the ratio
//     // of right to left. Higher percentage means more right,
//     // lower means more left.
//     findColorBetween: function(left, right, percentage) {
//         newColor = {};
//         components = ["r", "g", "b"];
//         for (var i = 0; i < components.length; i++) {
//             c = components[i];
//             newColor[c] = Math.round(left[c] + (right[c] - left[c]) * percentage / 100);
//         }
//         return new Color(newColor);
//     }
// }

// var c0 = new Color("#5eb95e");
// var c1 = new Color("#faa732");
// var c2 = new Color("#dd514c");

// var progressDemo = function() {
//     var i = 0;
//     var timeStep = 30; // ms
//     t = setInterval(function() {
//         var left, right, percentage;
//         if (i < 50) {
//             left = c0;
//             right = c1;
//             percentage = i*2;
//         } else {
//             left = c1;
//             right = c2;
//             percentage = (i - 50)*2;
//         }
//         var bgColor = LinearColorInterpolator.findColorBetween( left, right, percentage ).asRgbCss();
//         $('.bar').css({ backgroundColor: bgColor, width: "" + i + "%" })
//         $('.data').html(bgColor);
//         if (++i > 100) clearInterval(t);
//     }, timeStep);
// }

// $('.run').click(progressDemo);
// progressDemo();