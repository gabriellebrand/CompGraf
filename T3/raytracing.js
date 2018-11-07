var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//-------------------------
function paintPixel(img, x,y, color) {
    img.data[index(canvas, x,y)] = color.r*255;
    img.data[index(canvas, x,y)+1] = color.g*255;
    img.data[index(canvas, x,y)+2] = color.b*255;
    img.data[index(canvas, x,y)+3] = 255;
}

var alias = 4;
var applyAntialias = true;
var showAxis = false;

function getPixelAntialias(scene, x, y) {
    let pixel = Color();
    for(let i = 0; i < alias; ++i) {
        for (let j = 0; j < alias; ++j) {
            //dx, dy varia de -0.5 ate +0.5
            let dx = Math.random() - 0.5;
            let dy = Math.random() - 0.5;
            let subX = x + (i + 0.5 + dx)/alias;
            let subY = y + (j + 0.5 + dy)/alias;

            let subPixel = scene.trace(subX, subY);
            if (subPixel == null) {
                subPixel = scene.backgroundColor;
            }
            pixel.r += subPixel.r;
            pixel.g += subPixel.g;
            pixel.b += subPixel.b;
        }
    }

    let subPixels = alias*alias;
    pixel.r /= subPixels;
    pixel.g /= subPixels;
    pixel.b /= subPixels;

    return pixel;
}

function getPixel(scene, x, y) {
    let pixel = scene.trace(x, y);
    if (pixel === null)
        pixel = scene.backgroundColor;

    return pixel;
}

function render(scene) {
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < canvas.height; ++y) {
        for(let x = 0; x < canvas.width; ++x) {
            let pixel = Color();
            if (applyAntialias)
                pixel = getPixelAntialias(scene, x, y);
            else
                pixel = getPixel(scene, x, y);

            paintPixel(img, x, canvas.height - y, pixel);   
        }
    }

    ctx.putImageData(img,0,0);
}

//---------------------------------------

/* ========= CENA DAS NOTAS DE AULA ==========*/

// var camera = new Camera(90, canvas.width, canvas.height, 30, 230, vec3.fromValues(100,40,40), 
//                         vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));

// var backgroundColor = Color(0.4, 0.4, 0.4);
// var ambientLight = Color(0.2, 0.2, 0.2);
// var lightSphere = LightSphere12(vec3.fromValues(60,120,40), Color(0.8, 0.8, 0.8), 5);
// var lightSpot = LightSpot(vec3.fromValues(60,120,40), Color(0.8, 0.8, 0.8));
// var sphere = new Sphere(vec3.fromValues(0, 20, 0), 25, Color(0,1,1));
// var box1 = new BoundingBox(vec3.fromValues(-80, -50, -50), vec3.fromValues(50, -45, 50), 
//                            Color(0.7, 0.7, 0));
// var box2 = new BoundingBox(vec3.fromValues(-80, -50, -60), vec3.fromValues(50, 50, -50), 
//                            Color(0.7, 0.7, 0));   

// var scene = new Scene(camera, ambientLight);
// scene.setBackgroundColor(backgroundColor);
// scene.addLightSphere(lightSphere);
// scene.addObject(box1);
// scene.addObject(box2);
// scene.addObject(sphere);

/* ================= CENA 2 ===================*/
var camera = new Camera(90, canvas.width, canvas.height, 200, 1000, 
                        vec3.fromValues(70,70,70), vec3.fromValues(0,0,0), 
                        vec3.fromValues(0,1,0));
var backgroundColor = Color(0, 0, 0);
var ambientLight = Color(0.2, 0.2, 0.2);
//var light = LightSpot(vec3.fromValues(80,80,10), Color(0.8, 0.8, 0.8));
var lightSphere = LightSphere12(vec3.fromValues(80,80,20), Color(0.8, 0.8, 0.8), 8);                        
var lightSphere2 = LightSphere12(vec3.fromValues(20,80,80), Color(0.8, 0.8, 0.8), 8);   

var floor = new BoundingBox(vec3.fromValues(0, 0, 0), vec3.fromValues(100, 5, 100), 
                            Color(0.4, 0.4, 0.4));
var wall1 = new BoundingBox(vec3.fromValues(-10, 0, 0), vec3.fromValues(0, 100, 100),
    Color(0.4, 0.4, 0.4));
var wall2 = new BoundingBox(vec3.fromValues(0, 0, -10), vec3.fromValues(100, 100, 0),
    Color(0.4, 0.4, 0.4));

var sphere = new Sphere(vec3.fromValues(40, 13, 40), 8, Color(0.42,0.04,1));
var sphere2 = new Sphere(vec3.fromValues(40, 29, 40), 8, Color(1,0.04,0.13));
var sphere3 = new Sphere(vec3.fromValues(40, 45, 40), 8, Color(0,0.37,0.33));

var scene = new Scene(camera, ambientLight);
scene.setBackgroundColor(backgroundColor);
scene.addLightSphere(lightSphere);
scene.addLightSphere(lightSphere2);
scene.addObject(floor); 
scene.addObject(wall1);     
scene.addObject(wall2);   
scene.addObject(sphere);   
scene.addObject(sphere2);   
scene.addObject(sphere3);     

/*=============================================*/


if (showAxis) {
    var axisX = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(100, 0.5, 0.5), Color(1, 0, 0));
    var axisY = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 100, 0.5), Color(0, 1, 0));
    var axisZ = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 0.5, 100), Color(0, 0, 1));

    scene.addObject(axisX);
    scene.addObject(axisY);
    scene.addObject(axisZ);
}

render(scene);