
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const COLOR_BACKGROUND = {r: 0, g: 0, b: 0, a: 255};

function onShowImage(img) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function index(x,y) {
    return 4*y*canvas.width + 4*x;
}

var camera = new Camera(1.5708, 230, 230, 30, 230, vec3.fromValues(100,40,40), 
                        vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));

var rayTracer = new RayTracer(camera);

var sphere = new Sphere(vec3.fromValues(0, 20, 0), 25, {r: 0, g: 0, b: 255, a: 255});

var box = new BoundingBox(vec3.fromValues(-80, -50, -50), vec3.fromValues(50, -45, 50), 
                          {r: 0.7*255, g: 0.7*255, b: 0, a: 255});
var box2 = new BoundingBox(vec3.fromValues(-80, -50, -60), vec3.fromValues(50, 50, -50), 
                          {r: 0.7*255, g: 0.7*255, b: 0, a: 255});     

var objects = [box, box2, sphere];

function render() {
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < canvas.height-1; ++y) {
        for(let x = 0; x < canvas.width-1; ++x) {
            let ray = rayTracer.ray(x, y);

            for (let i = 0; i < objects.length; ++i) {
                let result = objects[i].hit(ray);
                //console.log(i);
                if(result.hit == true) {
                    let p = RayTracer.p(ray, result.t);
                    let color = objects[i].getPixelColor(p);
                    paintPixel(img, x, canvas.height - y, color);
                }
            }
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

/*
console.log("eye= ", camera.eye);
console.log("xe= ", camera.xe);
console.log("ye= ", camera.ye);
console.log("ze= ", camera.ze);
*/

render();