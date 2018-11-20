var isDown = false;
var lastPos = {x: 0, y: 0};
var currentPos = {x: 0, y: 0};
var r = 300; //height/2

function getMousePos(evt) {
	let rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

canvas.addEventListener('mousedown', function(e) {
    isDown = true;
    let pos = getMousePos(e);
    lastPos = pos;
    currentPos = pos;
    //console.log("Is Down " + pos.x + " " + pos.y);
}, true);

canvas.addEventListener('mouseup', function(e) {
    isDown = false;
}, true);

document.addEventListener('mousemove', function(e) {
    event.preventDefault();
    if (isDown) {
        let pos = getMousePos(e);
        if (pos.x == currentPos.x && pos.y == currentPos.y) return;

        lastPos = currentPos;
        currentPos = pos;

        calculateRotation();
  }
 }, true);

function getArcballVector(screenPos) {
    //normaliza as coordenadas da tela para o espaço de [-1, 1]
    var P = vec3.fromValues(screenPos.x - 400,
                            300 - screenPos.y,
                            0);

    //xˆ2 + yˆ2 + zˆ2 = 1 -> esfera virtual de raio 1
    let  OP_squared = P[0]*P[0] + P[1]*P[1];
    let r2 = r*r;
    if (OP_squared <= r2)
      P[2] = Math.sqrt(r2 - OP_squared);  // Pythagoras
    else
      P[2] = 0;

    return P;
  }

  function calculateRotation() {
      let va = getArcballVector(lastPos);
      let vb = getArcballVector(currentPos);
      console.log("va = "+ va);
      console.log("vb = "+ vb);

      let angle = vec3.angle(va, vb);
      let axis = vec3.create();

      //console.log(lastPos);
      //console.log(currentPos);

      //calcula o eixo de rotação (normalizado)
      vec3.cross(axis, va, vb);
      vec3.normalize(axis, axis);

      console.log("axis= "+ axis);
      console.log("angle= " + angle);

      rotationQuat = quat.create();
      quat.setAxisAngle(rotationQuat, axis, -angle);

      let rotationMatrix = mat4.create();
      mat4.fromQuat(rotationMatrix, rotationQuat);
      //up = [up[0]+eye[0], up[1]+eye[1], up[2]+eye[2]];
      vec3.transformMat4(eye, eye, rotationMatrix);
      //vec3.transformMat4(up, up, rotationMatrix);
      //up = [up[0]-eye[0], up[1]-eye[1], up[2]-eye[2]];
      mat4.lookAt(view, eye, center, up);
      //mat4.multiply(view, rotationMatrix, view);

      drawScene();
  }