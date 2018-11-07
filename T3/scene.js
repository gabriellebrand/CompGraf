class Scene {
    constructor (camera, ambientLight) {
        this.camera = camera;
        this.objects = [];
        this.lights = [];
        this.ambientLight = ambientLight;
        this.backgroundColor = Color(0,0,0);
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    addLightSpot(light) {
        this.lights.push(light);
    }

    addLightSphere(lightSphere) {
        for (let i = 0; i < lightSphere.points.length; ++i) {
            this.addLightSpot(LightSpot(lightSphere.points[i], lightSphere.color));
        }
    }

    addObject(object) {
        this.objects.push(object);
    }

    _checkShadowExistence(light, L, pos, objIndex) {
        let shadowFactor = 1;

        for (let i = 0; i < this.objects.length; i++) {
            let shadowRay = {o: pos, d: L};
            let result = this.objects[i].hit(shadowRay);

            if (result.hit == true) {
                let distLight = vec3.distance(light.pos, pos);
                let hitPoint = Camera.p(shadowRay, result.t);
                let distHitPoint = vec3.distance(hitPoint, pos);

                if (distHitPoint < distLight) {
                    shadowFactor = 0.25;
                    break;
                }
            }
        }

        return shadowFactor;
    }
    
    _applySpecularEffect(light, normal, pos, color, n, objIndex) {
        let L = sub(light.pos, pos);
        vec3.normalize(L, L);
        let Ln = vec3.dot(L, normal);
        let Lprojn = vec3.create();
        vec3.scale(Lprojn, normal, 2*Ln);
        let r = sub(Lprojn, L);
        let v = sub(camera.eye, pos);
        let cosA = vec3.dot(v, r) / (vec3.length(v) * vec3.length(r));

        let shadow = this._checkShadowExistence(light, L, pos, objIndex);

        //nao tem reflexao especular para as condicoes abaixo
        if (n < 0 || cosA <= 0 || shadow < 1.0) return Color(0, 0, 0);

        let cosA_n = Math.pow(cosA, n);
        return Color(light.color.r*color.r*cosA_n, 
                     light.color.g*color.g*cosA_n, 
                     light.color.b*color.b*cosA_n);
    }

    _applyDiffuseEffect(light, normal, pos, color, objIndex) {
        let L = sub(light.pos, pos);
        vec3.normalize(L, L);

        //shadowFactor -> se for = 1.0 não "adiciona" sombra
        let shadowFactor = this._checkShadowExistence(light, L, pos, objIndex);

        let Ln = vec3.dot(L, normal);
        return Color(light.color.r*color.r*Ln*shadowFactor, 
                     light.color.g*color.g*Ln*shadowFactor, 
                     light.color.b*color.b*Ln*shadowFactor);
    }
    
    _applyAmbientLight(light, color) {
        return Color(light.r*color.r, 
                     light.g*color.g, 
                     light.b*color.b);
    }

    _shade(ray, object, t, objIdx) {
        let p = Camera.p(ray, t);
        let c = object.getPixelColor(p);
        let n = object.normal(p);

        //calcula a contribuição de cada umas das luzes para a cor de saída
        let contributions = [];
        contributions.push(this._applyAmbientLight(ambientLight, c));
        for (let i = 0; i < this.lights.length; i++) {
            contributions.push(this._applyDiffuseEffect(this.lights[i], n, p, c, objIdx));
            contributions.push(this._applySpecularEffect(this.lights[i], n, p, 
                               object.specColor, object.nSpec, objIdx));
        }

        //soma a contribuições
        var colorOut = Color(0, 0, 0);
        for (let i = 0; i < contributions.length; i++) {
            colorOut.r += contributions[i].r;
            colorOut.g += contributions[i].g;
            colorOut.b += contributions[i].b;
        }
        return colorOut;
    }

    trace(x, y) {
        let ray = this.camera.ray(x, y);
        //closest = objeto mais próximo da camera (menor t)
        let closest = {obj: null, t: Number.POSITIVE_INFINITY};
        let closestIndex = -1;
        for (let i = 0; i < this.objects.length; ++i) {
            let result = this.objects[i].hit(ray);
            if (result.hit == true) {
                if (result.t < closest.t){
                    closest.obj = this.objects[i];
                    closest.t = result.t;
                    closestIndex = i;
                }
                    
            }
        }
        if (closest.t < Number.POSITIVE_INFINITY)
            return scene._shade(ray, closest.obj, closest.t, closestIndex);
        else
            return null;
    }
}