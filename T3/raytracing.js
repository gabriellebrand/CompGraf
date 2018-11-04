var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//-------------------------
function paintPixel(img, x,y, color) {
    img.data[index(canvas, x,y)] = color.r*255;
    img.data[index(canvas, x,y)+1] = color.g*255;
    img.data[index(canvas, x,y)+2] = color.b*255;
    img.data[index(canvas, x,y)+3] = 255;
}

function render(scene) {
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < canvas.height-1; ++y) {
        for(let x = 0; x < canvas.width-1; ++x) {
            let pixel = scene.trace(x, y);
            let color = scene.backgroundColor;
            if (pixel != null)
                color = pixel;

            paintPixel(img, x, canvas.height - y, color);   
        }
    }

    ctx.putImageData(img,0,0);
}

//---------------------------------------
var camera = new Camera(90, canvas.width, canvas.height, 30, 230, vec3.fromValues(100,40,40), 
                        vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));
var sphere = new Sphere(vec3.fromValues(0, 20, 0), 25, Color(0,0,1));
var box1 = new BoundingBox(vec3.fromValues(-80, -50, -50), vec3.fromValues(50, -45, 50), 
                           Color(0.7, 0.7, 0));
var box2 = new BoundingBox(vec3.fromValues(-80, -50, -60), vec3.fromValues(50, 50, -50), 
                           Color(0.7, 0.7, 0));   

var axisX = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(100, 0.5, 0.5), Color(1, 0, 0));
var axisY = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 100, 0.5), Color(0, 1, 0));
var axisZ = new BoundingBox(vec3.fromValues(0,0,0), vec3.fromValues(0.5, 0.5, 100), Color(0, 0, 1));

var light = Light(vec3.fromValues(40, 120, 0), Color(0.8, 0.8, 0.8));
//var light2 = Light(vec3.fromValues(40, 0, 0), Color(0.8, 0.8, 0.8));
var ambientLight = Color(0.2, 0.2, 0.2);

var scene = new Scene(camera, ambientLight);
scene.setBackgroundColor(Color(0.4, 0.4, 0.4));
scene.addLightSpot(light);
//scene.addLightSpot(light2);
scene.addObject(axisX);
scene.addObject(axisY);
scene.addObject(axisZ);
scene.addObject(box1);
scene.addObject(box2);
scene.addObject(sphere);

render(scene);