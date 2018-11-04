function onShowImage(canvas, img) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function index(canvas, x,y) {
    return 4*y*canvas.width + 4*x;
}

function sub(va, vb) {
    let v1 = vec3.clone(va);
    let v2 = vec3.clone(vb);
    vec3.negate(v2, v2);
    vec3.add(v1, v1, v2);  
    return v1;
}

function Color(r, g, b, a = 1) {
    return { r: r, g: g, b: b, a: a };
}