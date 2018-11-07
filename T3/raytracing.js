var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var alias = 4;
var applyAntialias = false;
var showAxis = false;

//-------------------------
function paintPixel(img, x,y, color) {
    img.data[index(canvas, x,y)] = color.r*255;
    img.data[index(canvas, x,y)+1] = color.g*255;
    img.data[index(canvas, x,y)+2] = color.b*255;
    img.data[index(canvas, x,y)+3] = 255;
}

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
/*=============================================*/

/* ========= CENA DAS NOTAS DE AULA ==========*/
function render1Pressed() {
    let xe = document.getElementById("xe1").value;
    let ye = document.getElementById("ye1").value;
    let ze = document.getElementById("ze1").value;
    let xc = document.getElementById("xc1").value;
    let yc = document.getElementById("yc1").value;
    let zc = document.getElementById("zc1").value;

    let lx = document.getElementById("lightx1").value;
    let ly = document.getElementById("lighty1").value;
    let lz = document.getElementById("lightz1").value;
    let lr = document.getElementById("lightR1").value;
    let lg = document.getElementById("lightG1").value;
    let lb = document.getElementById("lightB1").value;

    let sx = document.getElementById("spherex1").value;
    let sy = document.getElementById("spherey1").value;
    let sz = document.getElementById("spherez1").value;
    let sr = document.getElementById("sphereR1").value;
    let sg = document.getElementById("sphereG1").value;
    let sb = document.getElementById("sphereB1").value;
    let r = document.getElementById("sphereRatio1").value;

    let pmin1x = document.getElementById("pmin1x").value;
    let pmin1y = document.getElementById("pmin1y").value;
    let pmin1z = document.getElementById("pmin1z").value;
    let pmax1x = document.getElementById("pmax1x").value;
    let pmax1y = document.getElementById("pmax1y").value;
    let pmax1z = document.getElementById("pmax1z").value;
    let pmin2x = document.getElementById("pmin2x").value;
    let pmin2y = document.getElementById("pmin2y").value;
    let pmin2z = document.getElementById("pmin2z").value;
    let pmax2x = document.getElementById("pmax2x").value;
    let pmax2y = document.getElementById("pmax2y").value;
    let pmax2z = document.getElementById("pmax2z").value;

    let br = document.getElementById("boxR1").value;
    let bg = document.getElementById("boxG1").value;
    let bb = document.getElementById("boxB1").value;

    var camera = new Camera(90, canvas.width, canvas.height, 30, 230, vec3.fromValues(xe, ye, ze),
        vec3.fromValues(xc, yc, zc), vec3.fromValues(0, 1, 0));

    var backgroundColor = Color(0.4, 0.4, 0.4);
    var ambientLight = Color(0.2, 0.2, 0.2);
    var lightSphere = LightSphere12(vec3.fromValues(lx, ly, lz), Color(lr, lg, lb), 5);

    var sphere = new Sphere(vec3.fromValues(sx, sy, sz), r, Color(sr, sg, sb));
    var box1 = new BoundingBox(vec3.fromValues(pmin1x, pmin1y, pmin1z), vec3.fromValues(pmax1x, pmax1y, pmax1z),
        Color(br, bg, bb));
    var box2 = new BoundingBox(vec3.fromValues(-80, -50, -60), vec3.fromValues(50, 50, -50),
        Color(br, bg, bb));

    var scene = new Scene(camera, ambientLight);
    scene.setBackgroundColor(backgroundColor);
    scene.addLightSphere(lightSphere);
    scene.addObject(box1);
    scene.addObject(box2);
    scene.addObject(sphere);

    if (showAxis) {
        var axisX = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(100, 0.5, 0.5), Color(1, 0, 0));
        var axisY = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 100, 0.5), Color(0, 1, 0));
        var axisZ = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 0.5, 100), Color(0, 0, 1));
    
        scene.addObject(axisX);
        scene.addObject(axisY);
        scene.addObject(axisZ);
    }

    let antialiasCheckbox = document.getElementById("antialias");
    applyAntialias = antialiasCheckbox.checked;

    render(scene);
}

/* ================= CENA 2 ===================*/
function render2Pressed() {
    let xe = document.getElementById("xe2").value;
    let ye = document.getElementById("ye2").value;
    let ze = document.getElementById("ze2").value;
    let xc = document.getElementById("xc2").value;
    let yc = document.getElementById("yc2").value;
    let zc = document.getElementById("zc2").value;

    let lx1 = document.getElementById("lightx2").value;
    let ly1 = document.getElementById("lighty2").value;
    let lz1 = document.getElementById("lightz2").value;
    let lr1 = document.getElementById("lightR2").value;
    let lg1 = document.getElementById("lightG2").value;
    let lb1 = document.getElementById("lightB2").value;

    let lx2 = document.getElementById("lightx3").value;
    let ly2 = document.getElementById("lighty3").value;
    let lz2 = document.getElementById("lightz3").value;
    let lr2 = document.getElementById("lightR3").value;
    let lg2 = document.getElementById("lightG3").value;
    let lb2 = document.getElementById("lightB3").value;

    var camera = new Camera(90, canvas.width, canvas.height, 200, 1000,
                            vec3.fromValues(xe, ye, ze), vec3.fromValues(xc, yc, zc),
                            vec3.fromValues(0, 1, 0));
    var backgroundColor = Color(0, 0, 0);
    var ambientLight = Color(0.2, 0.2, 0.2);
    var lightSphere = LightSphere12(vec3.fromValues(lx1, ly1, lz1), Color(lr1, lg1, lb1), 8);
    var lightSphere2 = LightSphere12(vec3.fromValues(lx2, ly2, lz2), Color(lr2, lg2, lb2), 8);

    var floor = new BoundingBox(vec3.fromValues(0, 0, 0), vec3.fromValues(100, 5, 100),
        Color(0.4, 0.4, 0.4));
    var ceil = new BoundingBox(vec3.fromValues(0, 90, 0), vec3.fromValues(100, 105, 100),
        Color(0.4, 0.4, 0.4));
    var wall1 = new BoundingBox(vec3.fromValues(-10, 0, 0), vec3.fromValues(0, 100, 100),
        Color(0.4, 0.4, 0.4));
    var wall2 = new BoundingBox(vec3.fromValues(0, 0, -10), vec3.fromValues(100, 100, 0),
        Color(0.4, 0.4, 0.4));
    var wall3 = new BoundingBox(vec3.fromValues(90, 0, 0), vec3.fromValues(100, 100, 100),
        Color(0.4, 0.4, 0.4));

    var sphere = new Sphere(vec3.fromValues(40, 13, 40), 8, Color(0.42, 0.04, 1));
    var sphere2 = new Sphere(vec3.fromValues(56, 13, 40), 8, Color(1, 0.04, 0.13));
    var sphere3 = new Sphere(vec3.fromValues(48, 27, 40), 8, Color(0, 0.37, 0.33));

    var scene = new Scene(camera, ambientLight);
    scene.setBackgroundColor(backgroundColor);
    scene.addLightSphere(lightSphere);
    scene.addLightSphere(lightSphere2);
    scene.addObject(floor);
    scene.addObject(ceil);
    scene.addObject(wall1);
    scene.addObject(wall2);
    scene.addObject(wall3);
    scene.addObject(sphere);
    scene.addObject(sphere2);
    scene.addObject(sphere3);  

    if (showAxis) {
        var axisX = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(100, 0.5, 0.5), Color(1, 0, 0));
        var axisY = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 100, 0.5), Color(0, 1, 0));
        var axisZ = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 0.5, 100), Color(0, 0, 1));
    
        scene.addObject(axisX);
        scene.addObject(axisY);
        scene.addObject(axisZ);
    }

    let antialiasCheckbox = document.getElementById("antialias");
    applyAntialias = antialiasCheckbox.checked;

    render(scene);
    
}

render1Pressed();