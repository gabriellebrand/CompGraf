class Camera {
    constructor(fov, w, h, near, far, eye, center, up) {
        this.fov = fov;
        this.w = w;
        this.h = h;
        this.f = near;
        this.a = 2*near*Math.tan(fov/2);
        this.b = (w/h)*(this.a);
        this.eye = eye;

        this.ze = sub(eye, center);
        vec3.normalize(this.ze, this.ze);

        this.xe = vec3.create();
        vec3.cross(this.xe, up, this.ze);
        vec3.normalize(this.xe, this.xe);

        this.ye = vec3.create();
        vec3.cross(this.ye, this.ze, this.xe);
    }
}

class RayTracer {
    constructor (camera) {
        this.camera = camera;
    }

    //funcao parametrica p(t) = o + d(t)
    //recebe as coordenadas x, y do plano de projecao
    //retorna os valores de o e d, necessarios para o hit test
    ray(x, y) {
        var d = this.d(x, y);
        return {o: this.camera.eye, d: d};
    }

    //calcula a direcao d do raio
    d(x,y) {
        var d = vec3.create();

        //-fze
        let fze = vec3.create();
        vec3.scale(fze, this.camera.ze, this.camera.f);
        vec3.negate(fze, fze);        
        //a(y/h - 1/2)*ye
        let factorYe = this.camera.a*(y/this.camera.h - 0.5);
        let fye = vec3.create();
        vec3.scale(fye, this.camera.ye, factorYe);
        //b(x/w - 1/2)*xe
        let factorXe = this.camera.b*(x/this.camera.w - 0.5);
        let fxe = vec3.create();
        vec3.scale(fxe, this.camera.xe, factorXe);

        //d = -fze + a(y/h - 1/2)*ye + b(x/w - 1/2)*xe
        vec3.add(d, fze, fye);
        vec3.add(d, d, fxe);

        //vec3.normalize(d, d);
        return d;
    }

    //retorna o ponto tridimensional na reta do raio na posicao t
    p(ray, t) {
        let td = vec3.create();
        vec3.scale(td, ray.d, t);
        return vec3.add(td, ray.o, td);
    }
}

class Sphere {
    constructor (c, r, color) {
        this.c = c;
        this.r = r;
        this.color = color
    }

    hit (ray) {
        let o_c = sub(ray.o, this.c);
        //console.log(ray.d);
        //a = d.d
        let a = vec3.dot(ray.d, ray.d);

        //b = 2d.(o-c)
        let b = 2*vec3.dot(ray.d, o_c);
        //c = (o-c).(o-c) - rˆ2
        let c = vec3.dot(o_c, o_c) - this.r*this.r;

        let delta = b*b - 4*a*c;
        //console.log(delta);
        if(delta < 0)
            return {hit: false, t: NaN};

        let t1 = (-b - Math.sqrt(delta))/(2*a);
        let t2 = (-b + Math.sqrt(delta))/(2*a);

        return {hit: true, t: t1 > t2 ? t2 : t1};
    }

    normal (p) {
        var n = sub(p, this.c);
        vec3.normalize(n, n);
    }

    getpixelColor(p) {
        return this.color;
    }
}


function sub(va, vb) {
    let v1 = vec3.clone(va);
    let v2 = vec3.clone(vb);
    vec3.negate(v2, v2);
    vec3.add(v1, v1, v2);  
    return v1;
}