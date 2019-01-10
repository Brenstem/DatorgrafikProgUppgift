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

	paused: false,
	cull: false,
	depth: false
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

	initializeScene();


	window.requestAnimationFrame(frameCallback);
}



function initializeScene()
{
	createSquare();
	createHouse();
}

function createHouse()
{
	var positions = [ -15,10,-10, 15,10,-10,-15,10,10 //1
		, -15,10,10, 15,10,-10, 15,10,10 //2
		, -15,10,10, 15,10,10, 15,25,10 //3
		, -15,10,10, 15,25,10, -15,25,10 //4
		, 15,10,-10, -15,10,-10, -15,25,-10 //5
		, 15,10,-10, -15,25,-10, 15,25,-10 //6
		, 15,10,-10, 15,25,-10, 15,10,10 //7
		, 15,10,10, 15,25,-10, 15,25,10 //8
		, -15,10,10, -15,25,-10, -15,10,-10 //9
		, -15,10,10, -15,25,10, -15,25,-10 //10
		, 15,25,-10, -15,25,-10, 15,35,0 //11
		, -15,25,-10, -15,35,0, 15,35,0 //12
		, -15,25,10, 15,25,10, 15,35,0 //13
		, -15,25,10, 15,35,0, -15,35,0 //14
		, -15,25,-10, -15,25,10, -15,35,0 // 15
		, 15,25,10, 15,25,-10, 15,35,0 // 15
									];
	var colors = [ 0,1,0,1, 0,1,0,1, 0,1,0,1 //1
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //2
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //3
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //4
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //5
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //6
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //7
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //8
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //9
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //10
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //11
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //12
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //13
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //14
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //15
		, 0,1,0,1, 0,1,0,1, 0,1,0,1 //16
							];

	shared.house.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.house.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.house.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.house.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.house.triangleCount = positions.length / 3;
}

function createSquare()
{
	var positions = [-20,0,-20, -20,0,20, 20,0,-20 //1
									, -20,0,20, 20,0,20, 20,0,-20 //2
									];
	var colors = [0,0,1,1, 0,0,1,1, 0,0,1,1, //1
		 						0,0,1,1, 0,0,1,1, 0,0,1,1 //2

							];

	shared.square.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.square.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	shared.square.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shared.square.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	shared.square.triangleCount = positions.length / 3;
}



function frameCallback(time)
{
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
          gl.enable(gl.DEPTH_TEST);
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
	drawHouse();
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
