var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Pontos clicados no canvas
var inputPoints = [];
/*
*   bezierPoints -> guarda todos os pontos de controle da bézier cúbica.
*                   É um vetor com todos os segmentos que serão usados para calcular a curva.
*                   Cada segmento possui um vetor com 4 elementos: 
*                   segmento[0] -> p0 (ponto que passa pela curva)
*                   segmento[1] -> r  (1o ponto de controle)
*                   segmento[2] -> l  (2o ponto de controle)
*                   segmento[3] -> p1 (ponto que passa pela curva)
*/
var bezierPoints = [];
// Guarda todos os pontos da curva desenhada
var curvePoints = [];
// Ponto de preview
var guidePt = {x:0, y:0};

var isEditing = false;
var showPoints = true;
/*
* Guarda o ponto que está sendo editado no momento
*   index: índice do segmento na bezierPoints
*   type: tipo do ponto (p0, r, l, p1)
*/
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
    else if (evt.keyCode == 90) {
        showPoints = !showPoints;
        redraw();
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
    console.log(inputPoints.length);
	redraw();
}


/*
*   Aplica ajustes nos pontos de interpolação.
*   Pela estrutura usada para armazenar os segmentos, cada ponto, excetos os terminais,
*   está armazenado em dois segmentos, como p1 em um, e p0 em outro. É necessário aplicar a mesma translação 
*   no ponto correspondente no segmento vizinho, além de aplicar no ponto de controle vizinho.
*   newPoint = ponto que foi modificado
*   ctrlPt = ponto de controle vizinho do ponto modificado. Se newPt = p1, ctrlPt = l. newPt = p0 --> ctrlPt = r
*   ptAdj = ponto adjacente/correspondente no segmento vizinho. Se newPt = p1, então ptAdj = p0 e vice-versa.
*   ctrlPtAdj = ponto de controle vizinho do ptAdj.
*   isTerminal = se o ponto for terminal, não tem ponto duplicado
*   direction = localização do ponto correspondente. Se -1 -> ptAdj está no segmento anterior. Se +1 -> segmento posterior
*/
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
*   Busca, em todos os segmentos, o ponto mais próximo em um raio de 4 px
*   Retorna o índice do segmento e o tipo de ponto (p0=0, r=1, l=2, p1=3)
*/
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

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
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

    return 1/Math.floor(dist/1.5);
}

function getRho(p0, p1, p2) {
    let len0 = getDistance(p0, p1);
    let len1 = getDistance(p1, p2);
    return len0/(len0+len1);
}

/*
*   Calcula os pontos de curva de todos os segmentos
*/
function bezierCurve () {
    curvePoints.length = 0;
    for (let i=0; i<bezierPoints.length; i++) {
        addCubicSegment(bezierPoints[i]);
    }
}

/*
*   Adiciona na curva um segmento de bezier cúbica
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
*   Calcula pontos de controle do segmento da bezier
*   para somente dois pontos (reta)
*/
function calculate2PointsSegment(p0, p1) {
    return [p0, {x: p0.x + (1/3)*(p1.x - p0.x), y: p0.y + (1/3)*(p1.y - p0.y)},
            {x: p0.x + (2/3)*(p1.x - p0.x), y: p0.y + (2/3)*(p1.y - p0.y)}, p1];
}

/*
*   Calcula pontos de controle do segmento da bezier para 3 pontos.
*   As funções auxiliares r0, l1, r1 e l2 são as soluções para o sistema
*   [2    -1      0   0][r0] = [p0]
*   [0  (1-rho)  rho  0][l1] = [p1]
*   [1    -2      2  -1][r1] = [0]
*   [0     0     -1   2][l2] = [p2]
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
*   Calcula pontos de controle do segmento da bezier no método construtivo.
*   As funções auxiliares r0, ln_1, rn, ln são as soluções para o sistema
*   [(1-rho)  rho   0][ln_1] = [pn_1]
*   [  -2      2   -1][rn]   = [-rn_1]
*   [  0      -1    2][ln]   = [pn]
*/
function calculateNextPointSegment(p) {
    let lastSegment = bezierPoints[bezierPoints.length-1];
    let rho = getRho(lastSegment[0], lastSegment[3], p);
    bezierPoints[bezierPoints.length-1][2] = ln_1(lastSegment[1], p, 
                                                  lastSegment[3], rho);
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

var CTRL_PT_COLOR = "#e8b5b2";
var PT_COLOR = "#e29896";
var CURVE_COLOR = "#c06e6e";
var PREVIEW_COLOR = "#adad7b";

function redraw()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    // caso de não haver curvas
    if (inputPoints.length <= 1) {
        if (inputPoints.length == 1) {
            //desenha o primeiro ponto
            ctx.fillStyle = PT_COLOR;
            ctx.beginPath();
		    ctx.arc(inputPoints[0].x,inputPoints[0].y, 5, 0, 2*Math.PI, true);
            ctx.fill();

            let origin = inputPoints[0];
            drawPreviewLine(origin);
        }
        drawPreviewPoint();
        return;
    }

    //desenha a curva
    ctx.fillStyle = CURVE_COLOR;
	for(let i = 0; i < curvePoints.length; ++i)
	{
		ctx.beginPath();
		ctx.arc(curvePoints[i].x,curvePoints[i].y, 1.5, 0, 2*Math.PI, true);
		ctx.fill();
    }

    if (showPoints) {    
        // desenha os pontos de interpolacao
        ctx.fillStyle = PT_COLOR;
        for(let i = 0; i < bezierPoints.length; ++i)
        {
            ctx.beginPath();
            ctx.arc(bezierPoints[i][0].x,bezierPoints[i][0].y, 5, 0, 2*Math.PI, true);
            ctx.arc(bezierPoints[i][3].x,bezierPoints[i][3].y, 5, 0, 2*Math.PI, true);
            ctx.fill();
        }

        //desenha os pontos de controle
        ctx.fillStyle = CTRL_PT_COLOR;
        for(let i = 0; i < bezierPoints.length; ++i)
        {
            ctx.beginPath();
            ctx.arc(bezierPoints[i][1].x,bezierPoints[i][1].y, 5, 0, 2*Math.PI, true);
            ctx.arc(bezierPoints[i][2].x,bezierPoints[i][2].y, 5, 0, 2*Math.PI, true);
            ctx.fill();
        }
        ctx.strokeStyle = CTRL_PT_COLOR;
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
    }

    if (!isEditing) {
        let lastIndex = bezierPoints.length - 1;
        let origin = bezierPoints[lastIndex][3];
        drawPreviewLine(origin);
        drawPreviewPoint();
    }
}

function drawPreviewLine(origin) {
    if (!showPoints) return;
    //desenha linha guia
    ctx.strokeStyle = PREVIEW_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.x,origin.y);
    ctx.lineTo(guidePt.x,guidePt.y);
    ctx.stroke();
}

function drawPreviewPoint() {
    //desenha o ponto guia
    ctx.fillStyle = PREVIEW_COLOR;
    ctx.beginPath();
    ctx.arc(guidePt.x,guidePt.y, 5, 0, 2*Math.PI, true);
    ctx.fill();
}