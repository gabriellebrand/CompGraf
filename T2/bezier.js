var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var inputPoints = [];
var bezierPoints = [];
var curvePoints = [];
var guidePt = {x:0, y:0};

var isEditing = false;
var editingPtIndex = {index:-1, type:-1};

function onKeyDown(evt) {
    if (evt.keyCode == 16) {
        isEditing = true;
        document.body.style.cursor = "crosshair";
    }
}

function onKeyUp(evt) {
    if (evt.keyCode == 16) {
        isEditing = false;
        isDeleting = false;
        document.body.style.cursor = "default";
        editingPtIndex.index = -1;
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
    if (isEditing) {
        editingPtIndex = searchControlPoint(point);
        console.log(editingPtIndex);
    }
}
function onMouseMove(evt)
{
	guidePt = getMousePos(evt);
    if (editingPtIndex.index >= 0) {
        if (editingPtIndex.type == 0) {
            applyPointAdjustment(guidePt, 1, 3, 2, !(editingPtIndex.index > 0), -1);
        }
        else if (editingPtIndex.type == 3) {
            applyPointAdjustment(guidePt, 2, 0, 1, !(editingPtIndex.index < bezierPoints.length-1), 1);
        }

        bezierPoints[editingPtIndex.index][editingPtIndex.type] = guidePt;
        bezierCurve();
    }
        
	redraw();
}

function applyPointAdjustment(newPoint, ctrlPt, ptAdj, ctrlPtAdj, isTerminal, direction) {
    let dx = newPoint.x - bezierPoints[editingPtIndex.index][editingPtIndex.type].x;
    let dy = newPoint.y - bezierPoints[editingPtIndex.index][editingPtIndex.type].y;
    bezierPoints[editingPtIndex.index][ctrlPt].x += dx;
    bezierPoints[editingPtIndex.index][ctrlPt].y += dy;
    if (!isTerminal) {
        bezierPoints[editingPtIndex.index + direction][ptAdj] = newPoint;
        bezierPoints[editingPtIndex.index + direction][ctrlPtAdj].x += dx;
        bezierPoints[editingPtIndex.index + direction][ctrlPtAdj].y += dy;
    }
}

function onMouseUp(evt)
{
    if (isEditing) {
        //liberta o ponto que estava sendo editado
        editingPtIndex.index = -1;
        return;
    }

    let point = getMousePos(evt);
    inputPoints.push(point);
    
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
    curvePoints.length = 0;
    bezierPoints.length = 0;
    inputPoints.length = 0;
    redraw();
}

/*
* Busca o ponto mais próximo em um raio de 4 px
*/
function searchPoint(ptsArray, point) {
    let radius = 4;
    for (let i = 0; i < ptsArray.length; i++) {
        console.log(ptsArray);
        let dtX = Math.abs(ptsArray[i].x - point.x);
        let dtY = Math.abs(ptsArray[i].y - point.y);
        if (dtX < radius && dtY < radius) {
            return i;
        }
    }
    return -1;
}

function searchControlPoint(point) {
    let radius = 4;
    for (let i = 0; i < bezierPoints.length; i++) {
        for (let j = 0; j < 4; j++) {
            let dtX = Math.abs(bezierPoints[i][j].x - point.x);
            let dtY = Math.abs(bezierPoints[i][j].y - point.y);
            if (dtX < radius && dtY < radius) {
                return {index: i, type: j};
            }
        }
    }
    return {index:-1, type:-1};
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

    return 1/Math.floor(dist/2);
}

/*
* Adiciona na curva um segmento de bezier cúbica
*/
function addCubicSegment(controlPts) {
    let tStep = calculateStepSize(controlPts);
    for (let t = 0; t < 1; t+= tStep) {
        let factors = [(1-t)**3, 3*t*((1-t)**2), 3*t*t*(1-t), t**3];
        let x = factors[0]*controlPts[0].x + factors[1]*controlPts[1].x +
                factors[2]*controlPts[2].x + factors[3]*controlPts[3].x;
        let y = factors[0]*controlPts[0].y + factors[1]*controlPts[1].y +
                factors[2]*controlPts[2].y + factors[3]*controlPts[3].y;
        
        curvePoints.push({x: x, y: y});
    }
}

/*
* Calcula todos os segmentos de bezier da curva total
*/
function bezierCurve () {
    curvePoints.length = 0;
    for (let i=0; i<bezierPoints.length; i++) {
        addCubicSegment(bezierPoints[i]);
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
    if (inputPoints.length == 2) {
        bezierPoints.length = 0;
        let segment = calculate2PointsSegment(inputPoints[0], inputPoints[1]);
        bezierPoints.push(segment);
    }
    else if (inputPoints.length == 3) {
        bezierPoints.length = 0;
        calculate3PointsSegment(inputPoints[0], inputPoints[1], inputPoints[2])
    }
    else if (inputPoints.length > 3) {
            calculateNextPointSegment(inputPoints[inputPoints.length-1]);
    }
}

/* 
* Calcula pontos de controle do segmento da bezier
* para somente dois pontos (reta)
*/
function calculate2PointsSegment(p0, p1) {
    return [p0, {x: p0.x + (1/3)*(p1.x - p0.x), y: p0.y + (1/3)*(p1.y - p0.y)},
            {x: p0.x + (2/3)*(p1.x - p0.x), y: p0.y + (2/3)*(p1.y - p0.y)}, p1];
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

    let segment1 = [p0, r0(p0, p1, p2, rho), 
                    l1(p0, p1, p2, rho), p1];

    let segment2 = [p1, r1(p0, p1, p2, rho),
                    l2(p0, p1, p2, rho), p2];

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
    let rho = getRho(lastSegment[0], lastSegment[3], p);
    bezierPoints[bezierPoints.length-1][2] = ln_1(lastSegment[1], p, 
                                                 lastSegment[2], rho);
    let rn_pt = rn(lastSegment[1], p, lastSegment[3], rho);
    let ln_pt = ln(lastSegment[1], p, lastSegment[3], rho);
    bezierPoints.push([lastSegment[3], rn_pt, ln_pt, p]);
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

    ctx.fillStyle = "#FF0000";
    ctx.lineWidth = 1;
    ctx.beginPath();
	ctx.arc(guidePt.x,guidePt.y, 5, 0, 2*Math.PI, true);
    ctx.fill();
    if (inputPoints.length == 1) {
        ctx.beginPath();
		ctx.arc(inputPoints[0].x,inputPoints[0].y, 5, 0, 2*Math.PI, true);
        ctx.fill();
        return;
    }
	for(let i = 0; i < bezierPoints.length; ++i)
	{
		ctx.beginPath();
        ctx.arc(bezierPoints[i][0].x,bezierPoints[i][0].y, 5, 0, 2*Math.PI, true);
        ctx.arc(bezierPoints[i][3].x,bezierPoints[i][3].y, 5, 0, 2*Math.PI, true);
		ctx.fill();
    }
    
    ctx.fillStyle = "#FF00FF";
    ctx.lineWidth = 1;
	for(let i = 0; i < bezierPoints.length; ++i)
	{
		ctx.beginPath();
        ctx.arc(bezierPoints[i][1].x,bezierPoints[i][1].y, 5, 0, 2*Math.PI, true);
        ctx.arc(bezierPoints[i][2].x,bezierPoints[i][2].y, 5, 0, 2*Math.PI, true);
		ctx.fill();
    }

    ctx.strokeStyle = "#FF00FF";
    ctx.lineWidth = 1.5;
	for(let i = 0; i < bezierPoints.length; ++i)
	{
        ctx.beginPath();
        ctx.moveTo(bezierPoints[i][0].x,bezierPoints[i][0].y);
        ctx.lineTo(bezierPoints[i][1].x,bezierPoints[i][1].y);
        ctx.moveTo(bezierPoints[i][3].x,bezierPoints[i][3].y);
        ctx.lineTo(bezierPoints[i][2].x,bezierPoints[i][2].y);
		ctx.stroke(); 
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