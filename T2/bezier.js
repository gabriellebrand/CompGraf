var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var bezierPoints = [];
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
    else if (inputPoints.length >= 2) {
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
    let radius = 4;
    for (let i = 0; i < ptsArray.length; i++) {
        let dtX = Math.abs(ptsArray[i].x - point.x);
        let dtY = Math.abs(ptsArray[i].y - point.y);
        if (dtX < radius && dtY < radius) {
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
        dist += getDistance(ctrlPts[i], ctrlPts[i-1]);
    }

    return 1/Math.floor(dist);
}

/*
* Adiciona na curva um segmento de bezier cúbica
*/
function addCubicSegment(p0, r, l, p1) {
    let tStep = calculateStepSize([p0, r, l, p1]);
    for (let t = 0; t < 1; t+= tStep) {
        let factors = [(1-t)**3, 3*t*((1-t)**2), 3*t*t*(1-t), t**3];
        let x = factors[0]*p0.x + factors[1]*r.x +
                factors[2]*l.x + factors[3]*p1.x;
        let y = factors[0]*p0.y + factors[1]*r.y +
                factors[2]*l.y + factors[3]*p1.y;
        
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
    curvePoints.length = 0;
    for (let i=0; i<bezierPoints.length; i++) {
        addCubicSegment(bezierPoints[i].p0, bezierPoints[i].r, 
                        bezierPoints[i].l, bezierPoints[i].p1);
    }
}

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
}

function getRho(p0, p1, p2) {
    let len0 = getDistance(p0, p1);
    let len1 = getDistance(p1, p2);
    return len0/(len0+len1);
}

function calculateControlPoints() {
    bezierPoints.length = 0;
    if (inputPoints.length == 2) {
        let segment = calculate2PointsSegment(inputPoints[0], inputPoints[1]);
        bezierPoints.push(segment);
    }
    else if (inputPoints.length >= 3) {
        calculate3PointsSegment(inputPoints[0], inputPoints[1], inputPoints[2])
        for (i=3; i<inputPoints.length; i++) {
            calculateNextPointSegment(inputPoints[i]);
        }
    }

    bezierCurve();
}

/* 
* Calcula pontos de controle do segmento da bezier
* para somente dois pontos (reta)
*/
function calculate2PointsSegment(p0, p1) {
    return {
        p0: p0,
        r:{ x: p0.x + (1/3)*(p1.x - p0.x), y: p0.y + (1/3)*(p1.y - p0.y) },
        l:{ x: p0.x + (2/3)*(p1.x - p0.x), y: p0.y + (2/3)*(p1.y - p0.y) },
        p1: p1
    };
}

/*
* Calcula pontos de controle do segmento da bezier para 3 pontos.
* As funções auxiliares r0, l1, r1 e l2 são as soluções para o sistema
* [2    -1      0   0][r0] = [p0]
* [0  (1-rho)  rho  0][l1] = [p1]
* [1    -2      2  -1][r1] = [0]
* [0     0     -1   2][l2] = [p2]
*/
function calculate3PointsSegment(p0, p1, p2) {
    let rho = getRho(p0, p1, p2);

    let segment1 = {
        p0: p0,
        r:  r0(p0, p1, p2, rho),
        l:  l1(p0, p1, p2, rho),
        p1: p1
    };

    let segment2 = {
        p0: p1,
        r:  r1(p0, p1, p2, rho),
        l:  l2(p0, p1, p2, rho),
        p1: p2
    };

    bezierPoints.push(segment1);
    bezierPoints.push(segment2);
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

/*
* Calcula pontos de controle do segmento da bezier no método construtivo.
* As funções auxiliares r0, ln_1, rn, ln são as soluções para o sistema
* [(1-rho)  rho   0][ln_1] = [pn_1]
* [  -2      2   -1][rn]   = [-rn_1]
* [  0      -1    2][ln]   = [pn]
*/
function calculateNextPointSegment(p) {
    let lastSegment = bezierPoints[bezierPoints.length-1];
    let rho = getRho(lastSegment.p0, lastSegment.p1, p);
    bezierPoints[bezierPoints.length-1].l = ln_1(lastSegment.r, p, 
                                                 lastSegment.p1, rho);
    let rn_pt = rn(lastSegment.r, p, lastSegment.p1, rho);
    let ln_pt = ln(lastSegment.r, p, lastSegment.p1, rho);
    bezierPoints.push({p0: lastSegment.p1, r: rn_pt, l: ln_pt, p1: p});
}

function ln_1(rn_1, p, pn_1, rho) {
    return {
        x: (2*rho*rn_1.x - rho*p.x + 3*pn_1.x)/(rho + 3),
        y: (2*rho*rn_1.y - rho*p.y + 3*pn_1.y)/(rho + 3)
    }
}

function rn(rn_1, p, pn_1, rho) {
    return {
        x: (2*(rho-1)*rn_1.x + p.x*(1-rho) + 4*pn_1.x)/(rho + 3),
        y: (2*(rho-1)*rn_1.y + p.y*(1-rho) + 4*pn_1.y)/(rho + 3)
    }
}

function ln(rn_1, p, pn_1, rho) {
    return {
        x: (rn_1.x*(rho-1) + 2*(pn_1.x + p.x))/(rho + 3),
        y: (rn_1.y*(rho-1) + 2*(pn_1.y + p.y))/(rho + 3)
    } 
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