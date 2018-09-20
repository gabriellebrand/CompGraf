var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var controlPoints = [];
var inputPoints = [];
var curvePoints = [];
var guidePt = {x:0, y:0};

var isDeleting = false;
var isEditing = false;
var editingPtIndex = -1;

function onKeyDown(evt) {
    if (evt.keyCode == 16) {
        isEditing = true;
        document.body.style.cursor = "crosshair";
    }
    if (evt.keyCode == 90) {
        isDeleting = true;
        document.body.style.cursor = "not-allowed";
    }
}

function onKeyUp(evt) {
    if (evt.keyCode == 16 || evt.keyCode == 90) {
        isEditing = false;
        isDeleting = false;
        document.body.style.cursor = "default";
        editingPtIndex = -1;
    }
    else if (evt.keyCode == 32) {
        clearPath();
    }
}

function getMousePos(evt) {
	let rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function onMouseDown(evt) {
    let point = getMousePos(evt);
    if (isEditing)
        editingPtIndex = searchPoint(controlPoints, point);
}

function onMouseMove(evt)
{
	guidePt = getMousePos(evt);
    if (editingPtIndex >= 0) {
        controlPoints[editingPtIndex] = getMousePos(evt);
        bezierCurve();
    }
        
	redraw();
}

function onMouseUp(evt)
{
    if (isEditing) {
        //liberta o ponto que estava sendo editado
        editingPtIndex = -1;
        return;
    }

    let point = getMousePos(evt);

    if (isDeleting) {
        let ptIndex = searchPoint(inputPoints, point);
            inputPoints.splice(ptIndex, 1); //remove ponto da curva
    }
    else {
        inputPoints.push(point);
    }
    
    if (inputPoints.length > 100) {
        clearPath();
    }
    else if (inputPoints.length == 3) {
       calculateControlPoints();
        bezierCurve();
    }

	redraw();
}

/*
* Limpa todos os pontos de controle e a curva
*/
function clearPath() {
    controlPoints.length = 0;
    curvePoints.length = 0;
    redraw();
}

/*
* Busca o ponto mais próximo em um raio de 4 px
*/
function searchPoint(ptsArray, point) {
    for (let i = 0; i < ptsArray.length; i++) {
        let dtX = Math.abs(ptsArray[i].x - point.x);
        let dtY = Math.abs(ptsArray[i].y - point.y);
        if (dtX < 4 && dtY < 4) {
            return i;
        }
    }
    return -1;
}

/*
*   Calcula o step da parametrização
*   baseado na distância dos pontos de controle
*/
function calculateStepSize(ctrlPts) {
    var dist = 0;
    for (let i = 1; i < ctrlPts.length; i++) {
        dist += Math.sqrt((ctrlPts[i].x - ctrlPts[i-1].x)**2
                + (ctrlPts[i].y - ctrlPts[i-1].y)**2)
    }

    return 1/Math.floor(dist);
}

/*
* Adiciona na curva um segmento de bezier cúbica
*/
function addCubicSegment(ctrlPts) {
    let tStep = calculateStepSize(ctrlPts);
    for (let t = 0; t < 1; t+= tStep) {
        let factors = [(1-t)**3, 3*t*((1-t)**2), 3*t*t*(1-t), t**3];
        let x = factors[0]*ctrlPts[0].x + factors[1]*ctrlPts[1].x +
                factors[2]*ctrlPts[2].x + factors[3]*ctrlPts[3].x;
        let y = factors[0]*ctrlPts[0].y + factors[1]*ctrlPts[1].y +
                factors[2]*ctrlPts[2].y + factors[3]*ctrlPts[3].y;
        
        curvePoints.push({x: x, y: y});
    }
}

/*
* Adiciona na curva um segmento de bezier quadrática
*/
function addSquareSegment(ctrlPts) {
    let tStep = calculateStepSize(ctrlPts);
    for (let t = 0; t < 1; t+= tStep) {
        let factors = [(1-t)**2, 2*t*(1-t), t*t];
        let x = factors[0]*ctrlPts[0].x + factors[1]*ctrlPts[1].x +
                factors[2]*ctrlPts[2].x;
        let y = factors[0]*ctrlPts[0].y + factors[1]*ctrlPts[1].y +
                factors[2]*ctrlPts[2].y;
        
        curvePoints.push({x: x, y: y});
    }
}

/*
* Adiciona na curva um segmento de bezier linear
*/
function addLinearSegment(ctrlPts) {
    let tStep = calculateStepSize(ctrlPts);
    for (let t = 0; t < 1; t+= tStep) {
        let factors = [(1-t), t];
        let x = factors[0]*ctrlPts[0].x + factors[1]*ctrlPts[1].x;
        let y = factors[0]*ctrlPts[0].y + factors[1]*ctrlPts[1].y;
        
        curvePoints.push({x: x, y: y});
    }
}

/*
* Calcula todos os segmentos de bezier da curva total
*/
function bezierCurve () {
    if (controlPoints.length < 3)
        return;

    curvePoints.length = 0; //clear array

    let lastIndex = 0;
    for(let i = 3; i < controlPoints.length; i+=3) {
        let ctrls = [];
        ctrls[0] = controlPoints[i-3];
        ctrls[1] = controlPoints[i-2];
        ctrls[2] = controlPoints[i-1];
        ctrls[3] = controlPoints[i];
        lastIndex = i;
        addCubicSegment(ctrls);
    }
    /*
    if (lastIndex + 3 == controlPoints.length ) {
        let ctrls = [];
        ctrls[0] = controlPoints[lastIndex];
        ctrls[1] = controlPoints[lastIndex+1];
        ctrls[2] = controlPoints[lastIndex+2];
        addSquareSegment(ctrls);
    }
    else if (lastIndex + 2 == controlPoints.length) {
        let ctrls = [];
        ctrls[0] = controlPoints[lastIndex];
        ctrls[1] = controlPoints[lastIndex+1];
        addLinearSegment(ctrls);
    } 
    */

}

function calculateControlPoints() {
    let len0 = math.distance([inputPoints[0].x,inputPoints[0].y],
                             [inputPoints[1].x,inputPoints[1].y]);
    let len1 = math.distance([inputPoints[1].x,inputPoints[1].y],
                             [inputPoints[2].x,inputPoints[2].y]);
    let rho = len0/(len0+len1);

    let r00 = r0(inputPoints[0], inputPoints[1], inputPoints[2], rho);
    let l11 = l1(inputPoints[0], inputPoints[1], inputPoints[2], rho);
    let r11 = r1(inputPoints[0], inputPoints[1], inputPoints[2], rho);
    let l22 = l2(inputPoints[0], inputPoints[1], inputPoints[2], rho);

    controlPoints.length = 0; //clear array
    
    controlPoints.push(inputPoints[0]);
    controlPoints.push(r00);
    controlPoints.push(l11);
    controlPoints.push(inputPoints[1]);
    controlPoints.push(r11);
    controlPoints.push(l22);
    controlPoints.push(inputPoints[2]);

    console.log(controlPoints);

    bezierCurve();
}

function r0 (p0, p1, p2, rho) {
    return {x: (1/6)*(p0.x*rho+3*p0.x+3*p1.x-p2.x*rho),
            y: (1/6)*(p0.y*rho+3*p0.y+3*p1.y-p2.y*rho)};
}

function l1 (p0, p1, p2, rho) {
    return {x: (1/3)*(p0.x*rho+3*p1.x-p2.x*rho),
            y: (1/3)*(p0.y*rho+3*p1.y-p2.y*rho)};
}

function r1 (p0, p1, p2, rho) {
    return {x: (1/3)*(p0.x*rho-p0.x+3*p1.x-p2.x*rho+p2.x),
            y: (1/3)*(p0.y*rho-p0.y+3*p1.y-p2.y*rho+p2.y)};
}

function l2 (p0, p1, p2, rho) {
    return {x: (1/6)*(p0.x*rho-p0.x+3*p1.x-p2.x*rho+4*p2.x),
            y: (1/6)*(p0.y*rho-p0.y+3*p1.y-p2.y*rho+4*p2.y)};
}

function redraw()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);

	// ctx.strokeStyle = "#505050";
	// ctx.lineWidth = 3;
	// ctx.lineJoin = "round";
	// ctx.beginPath();
	// for(let i = 0; i < controlPoints.length; ++i)
	// {
	// 	ctx.lineTo(controlPoints[i].x,controlPoints[i].y);
    // }
    // ctx.lineTo(guidePt.x,guidePt.y);
	// ctx.stroke();

    ctx.fillStyle = "#FF0000";
    ctx.lineWidth = 1;
	for(let i = 0; i < inputPoints.length; ++i)
	{
		ctx.beginPath();
		ctx.arc(inputPoints[i].x,inputPoints[i].y, 5, 0, 2*Math.PI, true);
		ctx.fill();
    }
    ctx.beginPath();
	ctx.arc(guidePt.x,guidePt.y, 5, 0, 2*Math.PI, true);
    ctx.fill();
    
    ctx.fillStyle = "#00FFFF";
    ctx.lineWidth = 1;
	for(let i = 0; i < controlPoints.length; ++i)
	{
		ctx.beginPath();
		ctx.arc(controlPoints[i].x,controlPoints[i].y, 5, 0, 2*Math.PI, true);
		ctx.fill();
    }
    
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 2;
	for(let i = 0; i < curvePoints.length; ++i)
	{
		ctx.beginPath();
		ctx.arc(curvePoints[i].x,curvePoints[i].y, 2, 0, 2*Math.PI, true);
		ctx.fill();
	}
}