var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var controlPoints = [];
var guidePt = {x:0, y:0};
var curvePoints = [];

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
        let ptIndex = searchPoint(controlPoints, point);
            controlPoints.splice(ptIndex, 1); //remove ponto da curva
    }
    else {
        controlPoints.push(point);
    }
    
    if (controlPoints.length > 100) {
        clearPath();
    }
    else if (controlPoints.length >= 2) {
       //calculateControlPoints();
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
    if (controlPoints.length < 2)
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

}

function calculateControlPoints() {
    let ctrls = [];
    let A = [[2, -1,  0,  0],
             [0,  1,  1,  0],
             [1, -2,  2, -1], 
             [0,  0, -1,  2]];
    
    let bx = [controlPoints[0].x, 2*controlPoints[1].x, 0, controlPoints[2].x];
    let by = [controlPoints[0].y, 2*controlPoints[1].y, 0, controlPoints[2].y];

    let resX = math.usolve(A, bx);
    let resY = math.usolve(A, by);

    controlPoints.length = 0;
    for (i=0; i<4; i++) {
        controlPoints.push({x: resX[i], y: resY[i]});
    }
    bezierCurve();
}

function redraw()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);

	ctx.strokeStyle = "#505050";
	ctx.lineWidth = 3;
	ctx.lineJoin = "round";
	ctx.beginPath();
	for(let i = 0; i < controlPoints.length; ++i)
	{
		ctx.lineTo(controlPoints[i].x,controlPoints[i].y);
    }
    ctx.lineTo(guidePt.x,guidePt.y);
	ctx.stroke();

    ctx.fillStyle = "#0000FF";
    ctx.lineWidth = 1;
	for(let i = 0; i < controlPoints.length; ++i)
	{
		ctx.beginPath();
		ctx.arc(controlPoints[i].x,controlPoints[i].y, 5, 0, 2*Math.PI, true);
		ctx.fill();
    }
    ctx.beginPath();
	ctx.arc(guidePt.x,guidePt.y, 5, 0, 2*Math.PI, true);
	ctx.fill();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 2;
	for(let i = 0; i < curvePoints.length; ++i)
	{
		ctx.beginPath();
		ctx.arc(curvePoints[i].x,curvePoints[i].y, 2, 0, 2*Math.PI, true);
		ctx.fill();
	}
}

/*
var abs = Math.abs;

function array_fill(i, n, v) {
    var a = [];
    for (; i < n; i++) {
        a.push(v);
    }
    return a;
}

function gauss(A, x) {

    var i, k, j;

    // Just make a single matrix
    for (i=0; i < A.length; i++) { 
        A[i].push(x[i]);
        console.log(A[i]);
    }
    var n = A.length;

    for (i=0; i < n; i++) { 
        // Search for maximum in this column
        var maxEl = abs(A[i][i]),
            maxRow = i;
        for (k=i+1; k < n; k++) { 
            if (abs(A[k][i]) > maxEl) {
                maxEl = abs(A[k][i]);
                maxRow = k;
            }
        }


        // Swap maximum row with current row (column by column)
        for (k=i; k < n+1; k++) { 
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k=i+1; k < n; k++) { 
            var c = -A[k][i]/A[i][i];
            for (j=i; j < n+1; j++) { 
                if (i===j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    x = array_fill(0, n, 0);
    for (i=n-1; i > -1; i--) { 
        x[i] = A[i][n]/A[i][i];
        for (k=i-1; k > -1; k--) { 
            A[k][n] -= A[k][i] * x[i];
        }
    }

    return x;
}

*/