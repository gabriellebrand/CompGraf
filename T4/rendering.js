//Obtem o canvas, definido no .html
var canvas = document.getElementById("canvas");

//Usada para acessar as funcoes da OpenGL.
var gl;

//Um programa (conjunto de shaders) para ser executado na placa
var program;

//Encapsula um conjunto de definicoes sobre um objeto.
var objects = [];

//Matrizes de transformacao.
var view, proj;

function onLoad(){

    //Inicializar o contexto WebGL
    initGL();

    //Criar um programa (conjunto de shaders) WebGL
    initProgram("vertexShaderSrc2", "fragmentShaderSrc2");

    //Inicializar a cena
    initScene();

    //Desenhar a cena
    //drawCubes();
    //drawBunny();
    drawSphere();
}

function initGL(){
    //Obter contexto para o WebGL
    try 
	{
		//Obtem o contexto do canvas para webgl2.
        gl = canvas.getContext("webgl2");
		
		//Habilita o zuffer.
        gl.enable(gl.DEPTH_TEST);
		
		//Define cor de fundo.
		gl.clearColor( 0, 0, 0, 1);
		
		//Salva as dimensões do canvas.
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e)
	{
    }

    if (!gl)
	{
        alert("could not initialise WebGL");
    }
}


function createShader(shaderSource, shaderType){
    //Criar o objeto shader
    var shader = gl.createShader(shaderType);

    //Setar o código fonte
    gl.shaderSource(shader, shaderSource);

    //Compilar o shader
    gl.compileShader(shader);

    //Verificar se foi compilado com sucesso
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
		var info = gl.getShaderInfoLog( shader );
		throw 'Could not compile WebGL program. \n\n' + info;
    }

    //Retornar o shader
    return shader;
}

function initProgram(vertexShaderID, fragShaderID){
    //Criar e compilar os shaders
    var vertexShaderSrc = document.getElementById(vertexShaderID).text;
    var fragmentShaderSrc = document.getElementById(fragShaderID).text;
    var vertexShader = createShader(vertexShaderSrc,gl.VERTEX_SHADER);
    var fragmentShader = createShader(fragmentShaderSrc,gl.FRAGMENT_SHADER);

    //Criar o programa e linkar
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
       var info = gl.getProgramInfoLog(program);
	   throw 'Could not compile WebGL program. \n\n' + info;
    }

    //Usar o programa
    gl.useProgram(program);

    //Criar propriedades no programa guardando uniformes e atributos para uso posterior
    program.vertexPosAttr = gl.getAttribLocation(program,"vertexPos");
    program.vertexNormalAttr = gl.getAttribLocation(program, "vertexNormal");
    program.vertexColorAttr = gl.getAttribLocation(program, "color");

    program.mvUniform =  gl.getUniformLocation(program, "mv");
    program.nmUniform =  gl.getUniformLocation(program, "nm");
    program.mvpUniform = gl.getUniformLocation(program, "mvp");

    program.light = gl.getUniformLocation(program, "leye");

    program.amb = gl.getUniformLocation(program, "amb");
    program.dif = gl.getUniformLocation(program, "dif");
    program.spc = gl.getUniformLocation(program, "spc");
    program.shi = gl.getUniformLocation(program, "shi");
}

function initScene(){
    //Posições da câmera
    var eye = [20, 20, 20];
    var center = [0,0,0];
    var up = [0,1,0];

    //Definir as matrizes de view e projection
    view = mat4.create();
    proj = mat4.create();
    mat4.lookAt(view, eye, center, up);
    mat4.perspective(proj, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    //Criar os objetos
    var cube = Cube.createCubeData();
    cube.vao = Cube.createCubeVAO(gl, program, cube);
    objects.push(cube);

    var bunny = Bunny.createBunny();
    bunny.vao = Bunny.createBunnyVAO(gl, program, bunny);
    objects.push(bunny);

    var sphere = Sphere.createSphereData();
    sphere.vao = Sphere.createSphereVAO(gl, program, sphere);
    objects.push(sphere);
}

function drawSphere() {
    //Definir tamanho e limpar a janela
    gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    var lightPos = vec4.fromValues(10.0, 10.0, 10.0, 1.0);
    vec3.transformMat4(lightPos, lightPos, view);

    gl.bindVertexArray(objects[2].vao);

    var model = mat4.create();
    var modelView = mat4.create();
    var mvp = mat4.create();
    var nm = mat4.create();

    mat4.identity(model);

    mat4.multiply(modelView,view,model);
    mat4.multiply(mvp,proj,modelView);

    mat4.invert(nm, modelView);
    mat4.transpose(nm, nm);

    gl.uniformMatrix4fv(program.mvUniform, false, modelView);
    gl.uniformMatrix4fv(program.nmUniform, false, nm);
    gl.uniformMatrix4fv(program.mvpUniform, false, mvp);

    gl.uniform4fv(program.light, lightPos);
    gl.uniform3fv(program.amb, ambientLight);
    gl.uniform3fv(program.spc, objects[2].material.specular);
    gl.uniform1f(program.shi, objects[2].material.shi);
    
    //Desenhar
    gl.drawElements(gl.TRIANGLES, objects[2].elements.length, gl.UNSIGNED_SHORT, 0);

    //Desabilitar buffers habilitados
    gl.bindVertexArray(null);
}

function drawBunny() {
        //Definir tamanho e limpar a janela
        gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
        var lightPos = vec4.fromValues(10.0, 10.0, 10.0, 1.0);
        vec3.transformMat4(lightPos, lightPos, view);

        gl.bindVertexArray(objects[1].vao);

        var model = mat4.create();
        var modelView = mat4.create();
        var mvp = mat4.create();
        var nm = mat4.create();

        mat4.identity(model);
        //mat4.translate(model,model,[0.0,0,0.0]);

        mat4.identity(modelView);
        mat4.multiply(modelView,view,model);
        mat4.multiply(mvp,proj,modelView);

        mat4.invert(nm, modelView);
        mat4.transpose(nm, nm);

        gl.uniformMatrix4fv(program.mvUniform, false, modelView);
        gl.uniformMatrix4fv(program.nmUniform, false, nm);
        gl.uniformMatrix4fv(program.mvpUniform, false, mvp);

        gl.uniform4fv(program.light, lightPos);
        gl.uniform3fv(program.amb, ambientLight);
        gl.uniform3fv(program.spc, objects[1].material.specular);
        gl.uniform1f(program.shi, objects[1].material.shi);
        
        //Desenhar
        gl.drawElements(gl.TRIANGLES, objects[1].elements.length, gl.UNSIGNED_SHORT, 0);

        //Desabilitar buffers habilitados
        gl.bindVertexArray(null);
}

function drawCubes(){
    //Definir tamanho e limpar a janela
    gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    var lightPos = vec4.fromValues(10.0, 10.0, 10.0, 1.0);
    vec3.transformMat4(lightPos, lightPos, view);

    //Desenhar os objetos em diferentes posições
    var model = mat4.create();
    var modelView = mat4.create();
    var mvp = mat4.create();
    var nm = mat4.create();

    gl.bindVertexArray(objects[0].vao);

    for(let x = -5; x <= 5; x+=5 )
    {
        for(let z = -5; z <= 5; z+=5)
        {
            mat4.identity(model);
            mat4.translate(model,model,[x,0,z]);

            mat4.identity(modelView);
            mat4.multiply(modelView,view,model);
            mat4.multiply(mvp,proj,modelView);

            mat4.invert(nm, modelView);
            mat4.transpose(nm, nm);

            gl.uniformMatrix4fv(program.mvUniform, false, modelView);
            gl.uniformMatrix4fv(program.nmUniform, false, nm);
            gl.uniformMatrix4fv(program.mvpUniform, false, mvp);

            gl.uniform4fv(program.light, lightPos);
            gl.uniform3fv(program.amb, ambientLight);
            gl.uniform3fv(program.spc, objects[0].material.specular);
            gl.uniform1f(program.shi, objects[0].material.shi);
            
            
            //Desenhar
            gl.drawElements(gl.TRIANGLES, objects[0].elements.length, gl.UNSIGNED_SHORT, 0);
        }
    }

    //Desabilitar buffers habilitados
      gl.bindVertexArray(null);
}

function drawScene() {
    //Definir tamanho e limpar a janela
    gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
