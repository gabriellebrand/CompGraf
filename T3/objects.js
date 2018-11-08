class Sphere {
    constructor (c, r, color, reflect) {
        this.c = c;
        this.r = r;
        this.color = color
        this.nSpec = 50;
        this.specColor = Color(1,1,1);
        //fator de reflexao
        this.reflect = reflect;
    }

    hit (ray) {
        let o_c = sub(ray.o, this.c);

        //a = d.d
        let a = vec3.dot(ray.d, ray.d);
        //b = 2d.(o-c)
        let b = 2*vec3.dot(ray.d, o_c);
        //c = (o-c).(o-c) - rˆ2
        let c = vec3.dot(o_c, o_c) - this.r*this.r;

        let delta = b*b - 4*a*c;
        if (delta >= 0) {
            let t1 = (-b - Math.sqrt(delta)) / (2 * a);
            let t2 = (-b + Math.sqrt(delta)) / (2 * a);
            let tmin = t1 > t2 ? t2 : t1;

            //ERRO DE IMPRECISÃO NUMÉRICA!!!!
            if (tmin > 0.0001)
                return {hit: true, t: tmin};
        }

        return {hit: false, t: undefined};
    }

    normal(p) {
        var n = sub(p, this.c);
        vec3.normalize(n, n);
        return n;
    }

    getPixelColor(p) {
        return this.color;
    }
}


class BoundingBox {
    constructor (pmin, pmax, color, reflect) {
        this.pmin = pmin;
        this.pmax = pmax;
        this.color = color;
        this.nSpec = -1;
        this.specColor = Color(1,1,1);
        //fator de reflexao
        this.reflect = reflect;
    }

    hit(ray) {
        //testa se o raio intersecta uma determinada face da caixa
        //faceAxis: 0 (eixo x), 1 (eixo y) ou 2 (eixo z)
        //    face: xmin, xmax, ymin, ymax, zmin ou zmax
        //   axis1: 0 (x), 1 (y), ou 2 (z)
        //   axis2: 0 (x), 1 (y), ou 2 (z)
        //    self: passa a própria instancia da classe por parâmetro pois
        //          o objeto function não está capturando os atributos da instância...
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

            if (t > 0.0001) {
                //coordenada p do raio em tmin
                let p = Camera.p(ray, t);

                //verifica se a coordenada em t intersecta a face
                if (isInsideBounds(p))
                    return { hit: true, t: t };
            }
    
            return {hit: false, t: undefined};
        }

        //testa se o raio entra pela face [(xmin, ymin, zmin),(xmin, ymax, zmax)]
        if (ray.d[0] > 0) {
            let testFaceXMin = testBoxFace(0, this.pmin[0], 1, 2, this);
            if (testFaceXMin.hit == true)
                return testFaceXMin;
        }
        //testa se o raio entra pela face [(xmax, ymin, zmin),(xmax, ymax, zmax)]
        if (ray.d[0] < 0) {
            let testFaceXMax = testBoxFace(0, this.pmax[0], 1, 2, this);
            if (testFaceXMax.hit == true)
                return testFaceXMax;
        }
        //testa se o raio entra pela face [(xmin, ymin, zmin),(xmax, ymin, zmax)]
        if (ray.d[1] > 0) {
            let testFaceYMin = testBoxFace(1, this.pmin[1], 0, 2, this);
            if (testFaceYMin.hit == true)
                return testFaceYMin;
        }
        //testa se o raio entra pela face [(xmin, ymax, zmin),(xmax, ymax, zmax)]
        if (ray.d[1] < 0) {
            let testFaceYMax = testBoxFace(1, this.pmax[1], 0, 2, this);
            if (testFaceYMax.hit == true)
                return testFaceYMax;
        }
        //testa se o raio entra pela face [(xmin, ymin, zmin),(xmax, ymax, zmin)]
        if (ray.d[2] > 0) {
            let testFaceZMin = testBoxFace(2, this.pmin[2], 0, 1, this);
            if (testFaceZMin.hit == true)
                return testFaceZMin;
        }
        //testa se o raio entra pela face [(xmin, ymax, zmax),(xmax, ymax, zmax)]
        if (ray.d[2] < 0) {
            let testFaceZMax = testBoxFace(2, this.pmax[2], 0, 1, this);
            if (testFaceZMax.hit == true)
                return testFaceZMax;
        }

        return {hit:false, t: undefined};
    }

    normal(p) {
        //descobrir em que face da caixa o ponto está
        if (p[0] == this.pmin[0]) // face xmin (esquerda)
            return vec3.fromValues(-1,0,0);
        if (p[0] == this.pmax[0]) // face xmax (direita)
            return vec3.fromValues(1,0,0);
        if (p[1] == this.pmin[1]) // face ymin (inferior)
            return vec3.fromValues(0,-1,0);
        if (p[1] == this.pmax[1]) // face ymax (superior)
            return vec3.fromValues(0,1,0);
        if (p[2] == this.pmin[2]) // face zmin (traseira)
            return vec3.fromValues(0,0,-1);
        if (p[2] == this.pmax[2]) // face zmax (frontal)
            return vec3.fromValues(0,0,1);
            
        return undefined;

    }

    getPixelColor(p) {
        return this.color;
    }
        
}


//cria luz pontual
function LightSpot(pos, color) {
    return { pos: pos, 
             color: color,
             //spherePoints: createLightSphere(pos)
           };
}

//cria luz esférica (= 12 luzes pontuais equidistantes em uma superficie esferica)
function LightSphere12(pos, color, ratio) {
    var distributedColor = Color(color.r/12, color.g/12, color.b/12);
    return {points: _getLightSpherePoints12(pos, ratio),
            color: distributedColor};
}

//gera 12 vertices de um icosaedro
//center: centro do icosaedro
//size: noção de tamanho da esfera na verdade é o tamanho da aresta do poliedro
//https://www.gamedev.net/forums/topic/166260-distributing-equidistant-points-on-a-sphere/
function _getLightSpherePoints12(center, size) {
    let a = size*Math.sqrt(2 / (5 + Math.sqrt(5)));
    let b = size*Math.sqrt(2 / (5 - Math.sqrt(5)));

    var points = [vec3.fromValues(-a, 0, b), vec3.fromValues(a, 0, b), 
                  vec3.fromValues(-a, 0, -b), vec3.fromValues(a, 0, -b),
                  vec3.fromValues(0, b, a), vec3.fromValues(0, b, -a), 
                  vec3.fromValues(0, -b, a), vec3.fromValues(0, -b, -a),
                  vec3.fromValues(b, a, 0), vec3.fromValues(-b, a, 0), 
                  vec3.fromValues(b, -a, 0), vec3.fromValues(-b, -a, 0)];

    //translada os pontos criados para a posicao da luz pontual
    for (let i = 0; i < points.length; i++) {
        vec3.add(points[i], points[i], center);
    }

    return points;
}