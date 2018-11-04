class Camera {
    constructor(fov, w, h, near, far, eye, center, up) {
        this.fov = fov;
        this.w = w;
        this.h = h;
        this.f = near;
        this.eye = eye;

        //RADIANOS!!!!
        this.a = 2*near*Math.tan((fov*Math.PI)/(360));
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

    //funcao parametrica p(t) = o + d(t)
    //recebe as coordenadas x, y do plano de projecao
    //retorna os valores de o e d, necessarios para o hit test
    ray(x, y) {
        var d = this.d(x, y);
        return {o: this.eye, d: d};
    }

    //calcula a direcao d do raio
    d(x,y) {
        var d = vec3.fromValues(0,0,0);

        //-fze
        let fze = vec3.create();
        vec3.scale(fze, this.ze, this.f);
        vec3.negate(fze, fze);        
        //a(y/h - 1/2)*ye
        let factorYe = this.a*(y/this.h - 0.5);
        let fye = vec3.create();
        vec3.scale(fye, this.ye, factorYe);
        //b(x/w - 1/2)*xe
        let factorXe = this.b*(x/this.w - 0.5);
        let fxe = vec3.create();
        vec3.scale(fxe, this.xe, factorXe);

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