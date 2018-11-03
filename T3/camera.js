class Camera {
    constructor(fov, w, h, near, far, eye, center, up) {
        this.fov = fov;
        this.w = w;
        this.h = h;
        this.f = near;
        this.eye = eye;

        //RADIANOS!!!!
        this.a = 2*near*Math.tan(fov/2);
        this.b = (w/h)*(this.a);
        
        this.ze = sub(eye, center);
        vec3.normalize(this.ze, this.ze);

        this.xe = vec3.create();
        vec3.cross(this.xe, up, this.ze);
        vec3.normalize(this.xe, this.xe);

        this.ye = vec3.create();
        vec3.cross(this.ye, this.ze, this.xe);
        vec3.normalize(this.ye, this.ye);
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
        var d = vec3.fromValues(0,0,0);

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
    static p(ray, t) {
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

    normal(p) {
        var n = sub(p, this.c);
        vec3.normalize(n, n);
    }

    getPixelColor(p) {
        return this.color;
    }
}

class BoundingBox {
    constructor (pmin, pmax, color) {
        this.pmin = pmin;
        this.pmax = pmax;
        this.color = color;
    }

    hit(ray) {
        //testa se o raio intersecta uma determinada face da caixa
        //faceAxis: 0 (eixo x), 1 (eixo y) ou 2 (eixo z)
        //    face: xmin, xmax, ymin, ymax, zmin ou zmax
        //   axis1: 0 (x), 1 (y), ou 2 (z)
        //   axis2: 0 (x), 1 (y), ou 2 (z)
        var testBoxFace = function (faceAxis, face, axis1, axis2, self) {
            let isInsideBounds = function (coord) {
                //coord.axis1 pertence ao intervalo [axis1Min, axis1Max]?
                if (coord[axis1] >= self.pmin[axis1] && coord[axis1] <= self.pmax[axis1]) {
                    //coord.axis2 pertence ao intervalo [axis2Min, axis2Max]?
                    if (coord[axis2] >= self.pmin[axis2] && coord[axis2] <= self.pmax[axis2])
                        return true;
                }
                return false;
            }
    
            //valor de t no qual o raio intersecta o plano
            let t = (face - ray.o[faceAxis]) / ray.d[faceAxis];

            if (t >= 0) {
                //coordenada p do raio em tmin
                let p = RayTracer.p(ray, t);

                //verifica se a coordenada em t intersecta a face
                if (isInsideBounds(p))
                    return { hit: true, t: t };
            }
    
            return {hit: false, t: NaN};
        }

        //testa se o raio intercepta a face [(xmin, ymin, zmin),(xmin, ymax, zmax)]
        if (ray.d[0] > 0) {
            let testFaceXMin = testBoxFace(0, this.pmin[0], 1, 2, this);
            if (testFaceXMin.hit == true)
                return testFaceXMin;
        }
        //testa se o raio intercepta a face [(xmax, ymin, zmin),(xmax, ymax, zmax)]
        if (ray.d[0] < 0) {
            let testFaceXMax = testBoxFace(0, this.pmax[0], 1, 2, this);
            if (testFaceXMax.hit == true)
                return testFaceXMax;
        }
        //testa se o raio intercepta a face [(xmin, ymin, zmin),(xmax, ymin, zmax)]
        if (ray.d[1] > 0) {
            let testFaceYMin = testBoxFace(1, this.pmin[1], 0, 2, this);
            if (testFaceYMin.hit == true)
                return testFaceYMin;
        }
        //testa se o raio intercepta a face [(xmin, ymax, zmin),(xmax, ymax, zmax)]
        if (ray.d[1] < 0) {
            let testFaceYMax = testBoxFace(1, this.pmax[1], 0, 2, this);
            if (testFaceYMax.hit == true)
                return testFaceYMax;
        }
        //testa se o raio intercepta a face [(xmin, ymin, zmin),(xmax, ymax, zmin)]
        if (ray.d[2] > 0) {
            let testFaceZMin = testBoxFace(2, this.pmin[2], 0, 1, this);
            if (testFaceZMin.hit == true)
                return testFaceZMin;
        }
        //testa se o raio intercepta a face [(xmin, ymax, zmax),(xmax, ymax, zmax)]
        if (ray.d[2] < 0) {
            let testFaceZMax = testBoxFace(2, this.pmax[2], 0, 1, this);
            if (testFaceZMax.hit == true)
                return testFaceZMax;
        }

        return {hit:false, t: NaN};
    }

    normal(p) {
        //@TODO
    }

    getPixelColor(p) {
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