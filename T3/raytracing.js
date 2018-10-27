
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const COLOR_BACKGROUND = {r: 0, g: 0, b: 0, a: 255};

function onShowImage(img) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function index(x,y) {
    return 4*y*canvas.width + 4*x;
}

var camera = new Camera(45, 800, 600, 100, 0, vec3.fromValues(0,10,100), 
                        vec3.fromValues(50,0,0), vec3.fromValues(0,1,0));

var rayTracer = new RayTracer(camera);

var sphere = new Sphere(vec3.fromValues(100, 0, 0), 10, {r: 0, g: 0, b: 255, a: 255});

function render() {
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < canvas.height-1; ++y) {
        for(let x = 0; x < canvas.width-1; ++x) {
            let ray = rayTracer.ray(x, y);
            let result = sphere.hit(ray);
            let color;
            if(result.hit == false) {
                color = COLOR_BACKGROUND;
            }
            else {
                let p = rayTracer.p(ray, result.t);
                color = sphere.getpixelColor(p);
            }

            paintPixel(img, x,y, color);
            
        }
    }

    ctx.putImageData(img,0,0);
}

function paintPixel(img, x,y, color) {
    img.data[index(x,y)] = color.r;
    img.data[index(x,y)+1] = color.g;
    img.data[index(x,y)+2] = color.b;
    img.data[index(x,y)+3] = 255;
}

console.log("eye= ", camera.eye);
console.log("xe= ", camera.xe);
console.log("ye= ", camera.ye);
console.log("ze= ", camera.ze);

let ray = rayTracer.ray(400, 300)
console.log("ray= ", ray.o, ray.d);

render();