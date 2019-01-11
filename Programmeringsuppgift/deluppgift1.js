var gl;



var shared =
{
	worldMatrix: mat4.create(),
	viewMatrix: mat4.create(),
	projectionMatrix: mat4.create(),
	viewProjectionMatrix: mat4.create(),
	worldViewProjectionMatrix: mat4.create(),

	worldViewProjectionMatrixLocation: null,
	vertexPositionLocation: null,
	vertexColorLocation: null,

	time: 0,
	previousTime: 0,

	cameraPosition: vec3.create(),

	square: {positionBuffer: null, colorBuffer: null, triangleCount: 0},
	house: {positionBuffer: null, colorBuffer: null, triangleCount: 0},
	houseTwo: {positionBuffer: null, colorBuffer: null, indexBuffer: null, indexCount: 0},
	planeOne: {positionBuffer: null, colorBuffer: null, indexBuffer: null, indexCount: 0},
	planeTwo: {positionBuffer: null, colorBuffer: null, indexBuffer: null, indexCount: 0},

	paused: false,
	cull: false,
	depth: false,
	add: false
};



function main(context)
{
	gl = context;

	window.addEventListener("keydown", keydown);
	gl.canvas.addEventListener("mousemove", mousemove);

	var program = initializeProgram(vertexShader, fragmentShader);
	if (!program)
	{
		window.removeEventListener("keydown", keydown);
		gl.canvas.removeEventListener("mousemove", mousemove);
		return;
	}

	gl.useProgram(program);
	shared.worldViewProjectionMatrixLocation = gl.getUniformLocation(program, "u_worldViewProjection");
	shared.vertexPositionLocation = gl.getAttribLocation(program, "a_position");
	shared.vertexColorLocation = gl.getAttribLocation(program, "a_color");
	gl.enableVertexAttribArray(shared.vertexPositionLocation);
	gl.enableVertexAttribArray(shared.vertexColorLocation);

	var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
	mat4.perspective(shared.projectionMatrix, Math.PI/4, aspectRatio, 1, 150);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	initializeScene();

	window.requestAnimationFrame(frameCallback);
}



function initializeScene()
{
	createSquare();
	createHouse();
	createHouseTwo();
	createPlaneOne();
	createPlaneTwo();
}

function createPlaneOne(){
	var positions = [10,0,20 // 0
		, -10,0,20 // 1
		, 10,30,20 // 2
		, -10,30,20 // 3
		, 10,15,20 // 4
		, -10,15,20 // 5
];

	var indexes = [ 0,4,1
		, 1,4,5
		, 4,2,5
		, 5,2,3

];

	var colors = [
		1,0,0,1,
		1,0,0,1,
		1,0,0,0,
		1,0,0,0,
		1,0,0,0.5,
		1,0,0,0.5
];

	shared.planeOne.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeOne.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.planeOne.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeOne.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.planeOne.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shared.planeOne.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

	shared.planeOne.indexCount = indexes.length;
}

function createPlaneTwo(){
	var positions = [10,0,-20 // 0
		, -10,0,-20 // 1
		, 10,30,-20 // 2
		, -10,30,-20 // 3
		, 10,15,-20 // 4
		, -10,15,-20 // 5
];

	var indexes = [  0,1,4
		, 1,5,4
		, 4,5,2
		, 5,3,2
];

	var colors = [
		1,0,1,1,
		1,0,1,1,
		1,0,1,0,
		1,0,1,0,
		1,0,1,0.5,
		1,0,1,0.5
];

	shared.planeTwo.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeTwo.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.planeTwo.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeTwo.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.planeTwo.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shared.planeTwo.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

	shared.planeTwo.indexCount = indexes.length;
}

function createHouse(){
	var positions = [ -10,10,-5, 10,10,-5,-10,10,5 //1
		, -10,10,5, 10,10,-5, 10,10,5 //2
		, -10,10,5, 10,10,5, 10,15,5 //3
		, -10,10,5, 10,15,5, -10,15,5 //4
		, 10,10,-5, -10,10,-5, -10,15,-5 //5
		, 10,10,-5, -10,15,-5, 10,15,-5 //6
		, 10,10,-5, 10,15,-5, 10,10,5 //7
		, 10,10,5, 10,15,-5, 10,15,5 //8
		, -10,10,5, -10,15,-5, -10,10,-5 //9
		, -10,10,5, -10,15,5, -10,15,-5 //10
		, 10,15,-5, -10,15,-5, 10,20,0 //11
		, -10,15,-5, -10,20,0, 10,20,0 //12c
		, -10,15,5, 10,15,5, 10,20,0 //13
		, -10,15,5, 10,20,0, -10,20,0 //14
		, -10,15,-5, -10,15,5, -10,20,0 // 15
		, 10,15,5, 10,15,-5, 10,20,0 // 16
									];

	var colors = [ 0,1,0,1, 1,0,1,1, 0,0,1,1 //1
		, 0,0,1,1, 1,0,1,1, 1,0,0,1 //2
		, 0,0,1,1, 1,0,0,1, 1,1,1,1 //3
		, 0,0,1,1, 1,1,1,1, 0,1,1,1 //4
		, 1,0,1,1, 0,1,0,1, 1,1,0,1 //5
		, 1,0,1,1, 1,1,0,1, 0,5,1,1 //6
		, 1,0,1,1, 0,5,1,1, 1,0,0,1 //7
		, 1,0,0,1, 0,5,1,1, 1,1,1,1 //8
		, 0,0,1,1, 1,1,0,1, 0,1,0,1 //9
		, 0,0,1,1, 0,1,1,1, 1,1,0,1 //10
		, 0,5,1,1, 1,1,0,1, 5,0,3,1 //11
		, 1,1,0,1, 0,1,0,1, 5,0,3,1 //12
		, 0,1,1,1, 1,1,1,1, 5,0,3,1 //13
		, 0,1,1,1, 5,0,3,1, 0,1,0,1 //14
		, 1,1,0,1, 0,1,1,1, 0,1,0,1 //15
		, 1,1,1,1, 0,5,1,1, 5,0,3,1 //16
							];

	shared.house.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.house.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.house.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.house.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.house.triangleCount = positions.length / 3;
}

function createHouseTwo(){
	var positions = [ 10,10,5 // 0
		, -10,10,5 // 1
		, -10,10,-5 // 2
		, 10,10,-5 // 3
		, 10,15,5 // 4
		, -10,15,5 // 5
		, -10,15,-5 // 6
		, 10,15,-5 // 7
		, -10,20,0 // 8
		, 10,20,0 // 9
];

	var indexes = [ 2,3,1 // 1
	, 1,3,0 // 2
	, 1,0,4 // 3
	, 1,4,5 // 4
	, 3,2,6 // 5
	, 3,6,7 // 6
	, 3,7,0 // 7
	, 0,7,4 // 8
	, 1,6,2 // 9
	, 1,5,6 // 10
	, 7,6,9 // 11
	, 6,8,9 // 12
	, 5,4,9 // 13
	, 5,9,8 // 14
	, 6,5,8 // 15
	, 4,7,9 // 16
];

	var colors = [1,0,0,1
		, 0,0,1,1
		, 0,1,0,1
		, 1,0,1,1
		, 1,1,1,1
		, 0,1,1,1
		, 1,1,0,1
		, 0,5,1,1
		, 0,1,0,1
		, 5,0,3,1
							];

	shared.houseTwo.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.houseTwo.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.houseTwo.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.houseTwo.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.houseTwo.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shared.houseTwo.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

	shared.houseTwo.indexCount = indexes.length;
}

function createSquare(){
	var positions = [-10,0,-20, -10,0,20, 10,0,-20 //1
									, -10,0,20, 10,0,20, 10,0,-20 //2
									];
	var colors = [1,1,0,1, 1,1,0,1, 1,1,0,1, //1
		 						1,1,0,1, 1,1,0,1, 1,1,0,1 //2

							];

	shared.square.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.square.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.square.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.square.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.square.triangleCount = positions.length / 3;
}

function frameCallback(time){
	var deltaTime = time - shared.previousTime;
	if (!shared.paused) shared.time += deltaTime;
	shared.previousTime = time;

	frame(shared.time * 0.001);

	window.requestAnimationFrame(frameCallback);
}



function keydown(event)
{
	if (event.key == " ")
		shared.paused = !shared.paused;

if (event.key == "o") {
	if (shared.add == false) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		shared.add = true;
	}else {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		shared.add = false;
	}
}

	if (event.key == "c"){
      if(shared.cull == false){
          gl.enable(gl.CULL_FACE);
          shared.cull = true;
      }
      else{
          gl.disable(gl.CULL_FACE);
          shared.cull = false;
      }
  	}

		if (event.key == "z") {
			if(shared.depth == false){
          gl.enable(gl.DEPTH_TEST);
          shared.depth = true;
      }
      else{
          gl.disable(gl.DEPTH_TEST);
          shared.depth = false;
      }

		}
}



function mousemove(event)
{
}



function setWorldViewProjection()
{
	mat4.multiply(shared.worldViewProjectionMatrix, shared.viewProjectionMatrix, shared.worldMatrix);
	gl.uniformMatrix4fv(shared.worldViewProjectionMatrixLocation, false, shared.worldViewProjectionMatrix);
}



function frame(time)
{
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	vec3.set(shared.cameraPosition, Math.cos(time)*80, 0, Math.sin(time)*80);
	mat4.lookAt(shared.viewMatrix, shared.cameraPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
	mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

	drawScene(time);
}



function drawScene(time)
{
	var world = shared.worldMatrix;

	mat4.identity(world);
	mat4.translate(world, world, vec3.fromValues(0, -20, 0));

	setWorldViewProjection();
	drawSquare();

	mat4.identity(world);
	mat4.translate(world, world, vec3.fromValues(15, 10, 0));
	mat4.rotateZ(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(0, -10, 0));


	setWorldViewProjection();
	drawHouse();

	mat4.identity(world);
	mat4.translate(world, world, vec3.fromValues(-15, 10, 0));
	mat4.rotateZ(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(0, -10, 0));

	setWorldViewProjection();
	drawHouseTwo();

	gl.enable(gl.BLEND);
	gl.disable(gl.CULL_FACE);

	var x = vec3.fromValues(0,20,20);
	var y = vec3.fromValues(0,20,-20);

	var distance1 = vec3.distance(shared.cameraPosition, x);
	var distance2 = vec3.distance(shared.cameraPosition, y);

	if (distance1 > distance2) {
		mat4.identity(world);
		mat4.translate(world, world, vec3.fromValues(0, -20, 0));

		setWorldViewProjection();
		drawPlaneOne();

		mat4.identity(world);
		mat4.translate(world, world, vec3.fromValues(0, -20, 0));

		setWorldViewProjection();
		drawPlaneTwo();

		if (shared.cull == true) {
			gl.enable(gl.CULL_FACE);
		}

	}else if (distance2 > distance1) {
		mat4.identity(world);
		mat4.translate(world, world, vec3.fromValues(0, -20, 0));

		setWorldViewProjection();
		drawPlaneTwo();

		mat4.identity(world);
		mat4.translate(world, world, vec3.fromValues(0, -20, 0));

		setWorldViewProjection();
		drawPlaneOne();

		if (shared.cull == true) {
			gl.enable(gl.CULL_FACE);
		}
	}
}

function drawSquare()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.square.positionBuffer);
	gl.vertexAttribPointer(shared.vertexPositionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, shared.square.colorBuffer);
	gl.vertexAttribPointer(shared.vertexColorLocation, 4, gl.FLOAT, gl.FALSE, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, shared.square.triangleCount);
}

function drawHouse()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.house.positionBuffer);
	gl.vertexAttribPointer(shared.vertexPositionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, shared.house.colorBuffer);
	gl.vertexAttribPointer(shared.vertexColorLocation, 4, gl.FLOAT, gl.FALSE, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, shared.house.triangleCount);
}

function drawHouseTwo()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.houseTwo.positionBuffer);
	gl.vertexAttribPointer(shared.vertexPositionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, shared.houseTwo.colorBuffer);
	gl.vertexAttribPointer(shared.vertexColorLocation, 4, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shared.houseTwo.indexBuffer);
	gl.drawElements(gl.TRIANGLES, shared.houseTwo.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawPlaneOne()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeOne.positionBuffer);
	gl.vertexAttribPointer(shared.vertexPositionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeOne.colorBuffer);
	gl.vertexAttribPointer(shared.vertexColorLocation, 4, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shared.planeOne.indexBuffer);
	gl.drawElements(gl.TRIANGLES, shared.planeOne.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawPlaneTwo()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeTwo.positionBuffer);
	gl.vertexAttribPointer(shared.vertexPositionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, shared.planeTwo.colorBuffer);
	gl.vertexAttribPointer(shared.vertexColorLocation, 4, gl.FLOAT, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shared.planeTwo.indexBuffer);
	gl.drawElements(gl.TRIANGLES, shared.planeTwo.indexCount, gl.UNSIGNED_SHORT, 0);
}



var vertexShader =
`
	uniform mat4 u_worldViewProjection;
	attribute vec4 a_position;
	attribute vec4 a_color;
	varying vec4 v_color;

	void main(void)
	{
		v_color = a_color;
		gl_Position = u_worldViewProjection * a_position;
	}
`;



var fragmentShader =
`
	varying highp vec4 v_color;

	void main(void)
	{
		gl_FragColor = v_color;
	}
`;
