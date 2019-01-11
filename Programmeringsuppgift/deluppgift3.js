var gl;



var shared =
{
	worldMatrix: mat4.create(),
	viewMatrix: mat4.create(),
	projectionMatrix: mat4.create(),
	viewProjectionMatrix: mat4.create(),
	worldViewProjectionMatrix: mat4.create(),
	worldInverseMatrix: mat4.create(),
	billboardMatrix: mat4.create(),
	lightIntensity: 1,
	ambientColor: vec4.create(),
	lightPosition: vec4.create(),
	lightPositionObject: vec4.create(),

	worldViewProjectionMatrixLocation: null,
	lightingEnabledLocation: null,
	lightIntensityLocation: null,
	ambientColorLocation: null,
	lightPositionLocation: null,
	vertexPositionLocation: null,
	vertexTextureCoordinateLocation: null,
	vertexNormalLocation: null,

	time: 0,
	previousTime: 0,
	run: true,

	worldMatrixStack: [],

	camera: null,
	cameraTwo: null,
	cameraThree: null,
	cameraFour: null,
	cameraDeltaX: null,
	cameraDeltaZ: null,
	cameraView: true,

	cameraRotationX: 0,
	cameraRotationY: 0,
	cameraRotationZ: 0,
	discoMode: false,
	discoBall: false,

	planeObject: null,
	coneObject: null,
	sphereObject: null,

	chessboardTexture: null,
	whiteTexture: null,

	paused: false
};



function main(context)
{
	gl = context;


	window.addEventListener("keydown", keydown);
	window.addEventListener("keyup", keyup);
	gl.canvas.addEventListener("mousemove", mousemove);

	var program = initializeProgram(vertexShader, fragmentShader);
	if (!program)
	{
		window.removeEventListener("keydown", keydown);
		window.removeEventListener("keyup", keyup);
		gl.canvas.removeEventListener("mousemove", mousemove);
		return;
	}

	gl.useProgram(program);
	shared.worldViewProjectionMatrixLocation = gl.getUniformLocation(program, "u_worldViewProjection");
	shared.lightingEnabledLocation = gl.getUniformLocation(program, "u_lightingEnabled");
	shared.lightIntensityLocation = gl.getUniformLocation(program, "u_lightIntensity");
	shared.ambientColorLocation = gl.getUniformLocation(program, "u_ambientColor");
	shared.lightPositionLocation = gl.getUniformLocation(program, "u_lightPosition");
	shared.vertexPositionLocation = gl.getAttribLocation(program, "a_position");
	shared.vertexTextureCoordinateLocation = gl.getAttribLocation(program, "a_textureCoordinate");
	shared.vertexNormalLocation = gl.getAttribLocation(program, "a_normal");
	gl.enableVertexAttribArray(shared.vertexPositionLocation);
	gl.enableVertexAttribArray(shared.vertexTextureCoordinateLocation);
	gl.enableVertexAttribArray(shared.vertexNormalLocation);

	var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
	mat4.perspective(shared.projectionMatrix, Math.PI/4, aspectRatio, 1, 200);

	initializeScene();


	window.requestAnimationFrame(frameCallback);
}



function initializeScene()
{
	shared.camera = createCamera(0, 0, -85);
	shared.cameraTwo = createCamera(0, 0, -105);
	shared.cameraThree = createCamera(50, 0, -85);
	shared.cameraFour = createCamera(0, 90, 0);

	rotateCameraY(shared.cameraThree, Math.PI / 4.0000001);
	rotateCameraX(shared.cameraFour, -Math.PI / 2.000001);

	shared.planeObject = twgl.primitives.createPlaneBufferInfo(gl, 90, 90, 16, 16);
	shared.coneObject = twgl.primitives.createTruncatedConeBufferInfo(gl, 8, 2, 40, 32, 32);
	shared.sphereObject = twgl.primitives.createSphereBufferInfo(gl, 1.5, 32, 32);

	shared.chessboardTexture = loadTexture("chessboard.png");
	shared.whiteTexture = loadTexture("white.png");
}



function frameCallback(time)
{
	var deltaTime = time - shared.previousTime;
	if (!shared.paused) shared.time += deltaTime;
	shared.previousTime = time;

	frame(shared.time * 0.001, deltaTime * 0.001);

	if (shared.run) window.requestAnimationFrame(frameCallback);
}



function keydown(event)
{
	switch (event.key)
	{
		case " ":
			shared.paused = !shared.paused;
			break;
		case "W":
		case "w":
			shared.cameraDeltaZ = 2;
			break;
		case "S":
		case "s":
			shared.cameraDeltaZ = -2;
			break;
		case "D":
		case "d":
			shared.cameraDeltaX = -2;
			break;
		case "A":
		case "a":
			shared.cameraDeltaX = 2;
			break;
		case "Shift":
			shared.cameraView = !shared.cameraView;
			break;
		case "l":
			shared.discoMode = !shared.discoMode;
			break;
		case "b":
			shared.discoBall = !shared.discoBall;
			break;
	}
}



function keyup(event)
{
	switch (event.key)
	{
		case "W":
		case "w":
		case "S":
		case "s":
			shared.cameraDeltaZ = 0;
			break;
		case "D":
		case "d":
		case "A":
		case "a":
			shared.cameraDeltaX = 0;
		break;
	}
}



function mousemove(event)
{
	if (event.buttons == 1)
	{
		shared.cameraRotationX = event.movementY * 0.005;
		shared.cameraRotationY = event.movementX * 0.005;

		rotateCameraX(shared.camera, shared.cameraRotationX);
		rotateCameraY(shared.camera, shared.cameraRotationY);
	}
	if (event.buttons == 2)
	{
		shared.cameraRotationZ = event.movementX * 0.005;
		rotateCameraZ(shared.camera, shared.cameraRotationZ);
	}
}



function setTransformationAndLighting(lighting)
{
	mat4.multiply(shared.worldViewProjectionMatrix, shared.viewProjectionMatrix, shared.worldMatrix);
	gl.uniformMatrix4fv(shared.worldViewProjectionMatrixLocation, false, shared.worldViewProjectionMatrix);

	gl.uniformMatrix4fv(shared.worldMatrixLocation, false, shared.worldMatrix);

	gl.uniform1i(shared.lightingEnabledLocation, lighting);

	gl.uniform1f(shared.lightIntensityLocation, shared.lightIntensity);

	mat4.invert(shared.worldInverseMatrix, shared.worldMatrix);
	vec4.transformMat4(shared.lightPositionObject, shared.lightPosition, shared.worldInverseMatrix);
	gl.uniform4fv(shared.lightPositionLocation, shared.lightPositionObject);

	gl.uniform4fv(shared.ambientColorLocation, shared.ambientColor);
}



function pushWorldMatrix()
{
	shared.worldMatrixStack.push(mat4.clone(shared.worldMatrix));
}



function popWorldMatrix()
{
	if (shared.worldMatrixStack.length == 0)
	{
		console.log("worldMatrixStack: Can't pop matrix from empty stack");
	}

	mat4.copy(shared.worldMatrix, shared.worldMatrixStack.pop());
}



function drawObject(object)
{
	gl.bindBuffer(gl.ARRAY_BUFFER, object.attribs.position.buffer);
	gl.vertexAttribPointer(shared.vertexPositionLocation, object.attribs.position.numComponents, object.attribs.position.type, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, object.attribs.texcoord.buffer);
	gl.vertexAttribPointer(shared.vertexTextureCoordinateLocation, object.attribs.texcoord.numComponents, object.attribs.texcoord.type, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, object.attribs.normal.buffer);
	gl.vertexAttribPointer(shared.vertexNormalLocation, object.attribs.normal.numComponents, object.attribs.normal.type, gl.FALSE, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indices);
	gl.drawElements(gl.TRIANGLES, object.numElements, object.elementType, 0);
}



function frame(time, deltaTime)
{
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	if (shared.discoMode)
	{
		gl.viewport(0, 0, 400, 250);

		updateCamera(shared.camera);
		mat4.copy(shared.viewMatrix, shared.camera.matrix);
		mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

		translateCameraX(shared.camera, shared.cameraDeltaX, shared.cameraView);
		translateCameraZ(shared.camera, shared.cameraDeltaZ, shared.cameraView);

		drawScene(time);

		gl.viewport(0, 250, 400, 250);

		updateCamera(shared.cameraTwo);
		mat4.copy(shared.viewMatrix, shared.cameraTwo.matrix);
		mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

		drawScene(time);

		gl.viewport(400, 250, 400, 250);

		updateCamera(shared.cameraThree);
		mat4.copy(shared.viewMatrix, shared.cameraThree.matrix);
		mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

		drawScene(time);

		gl.viewport(400, 0, 400, 250);

		updateCamera(shared.cameraFour);
		mat4.copy(shared.viewMatrix, shared.cameraFour.matrix);
		mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

		drawScene(time);

	}
	else
	{
		gl.viewport(0, 0, 800, 500);

		updateCamera(shared.camera);
		mat4.copy(shared.viewMatrix, shared.camera.matrix);
		mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

		translateCameraX(shared.camera, shared.cameraDeltaX, shared.cameraView);
		translateCameraZ(shared.camera, shared.cameraDeltaZ, shared.cameraView);

		drawScene(time);
	}


	if (shared.worldMatrixStack.length > 0)
	{
		console.log("worldMatrixStack: Push and pop misalignment");
		shared.run = false;
	}
}



function drawScene(time)
{
	shared.ambientColor = vec4.fromValues(0.5, 0.5, 0.5, 1);
	shared.lightIntensity = 0.9;

	var world = shared.worldMatrix;

	if (!shared.discoBall)
	{
		shared.lightPosition = vec4.fromValues(0, 5, 0, 1);
	}else if (shared.discoBall)
	{
		shared.lightPosition = vec4.fromValues(shared.camera.position[0], shared.camera.position[1], shared.camera.position[2], 1)
	}

	mat4.identity(world);


	pushWorldMatrix();

	mat4.translate(world, world, vec3.fromValues(0, -20, 0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.chessboardTexture);
	drawObject(shared.planeObject);

	popWorldMatrix();


	drawCones(35);

	if (!shared.discoBall) {
		pushWorldMatrix();

		mat4.translate(world, world, vec3.fromValues(0, 5, 0));

		setTransformationAndLighting(false);
		gl.bindTexture(gl.TEXTURE_2D, shared.whiteTexture);
		drawObject(shared.sphereObject);

		popWorldMatrix();
	}


	pushWorldMatrix();

	mat4.translate(world, world, vec3.fromValues(15, 10, 3));
	mat4.scale(world, world, vec3.fromValues(3, 3, 3));

	setTransformationAndLighting(false);
	gl.bindTexture(gl.TEXTURE_2D, shared.chessboardTexture);
	drawObject(shared.sphereObject);

	popWorldMatrix();

	pushWorldMatrix();

	mat4.translate(world, world, shared.camera.position);
	mat4.scale(world, world, vec3.fromValues(3, 3, 3));

	setTransformationAndLighting(false);
	gl.bindTexture(gl.TEXTURE_2D, shared.chessboardTexture);
	drawObject(shared.sphereObject);

	popWorldMatrix();
}



function drawCones(distance)
{
	var world = shared.worldMatrix;

	gl.bindTexture(gl.TEXTURE_2D, shared.chessboardTexture);

	pushWorldMatrix();
	mat4.translate(world, world, vec3.fromValues(-distance, 0, -distance));
	setTransformationAndLighting(true);
	drawObject(shared.coneObject);
	popWorldMatrix();

	pushWorldMatrix();
	mat4.translate(world, world, vec3.fromValues(-distance, 0, distance));
	setTransformationAndLighting(true);
	drawObject(shared.coneObject);
	popWorldMatrix();

	pushWorldMatrix();
	mat4.translate(world, world, vec3.fromValues(distance, 0, -distance));
	setTransformationAndLighting(true);
	drawObject(shared.coneObject);
	popWorldMatrix();

	pushWorldMatrix();
	mat4.translate(world, world, vec3.fromValues(distance, 0, distance));
	setTransformationAndLighting(true);
	drawObject(shared.coneObject);
	popWorldMatrix();
}



var vertexShader =
`
	uniform mat4 u_worldViewProjection;
	uniform bool u_lightingEnabled;
	uniform float u_lightIntensity;
	uniform vec4 u_lightPosition;
	attribute vec4 a_position;
	attribute vec2 a_textureCoordinate;
	attribute vec3 a_normal;
	varying vec2 v_textureCoordinate;
	varying float v_diffuse;

	void main(void)
	{
		v_diffuse = 0.0;
		if (u_lightingEnabled)
		{
			vec3 lightDirection = normalize(u_lightPosition.xyz - a_position.xyz);
			v_diffuse = max(dot(a_normal, lightDirection), 0.0) * u_lightIntensity;
		}
		v_textureCoordinate = a_textureCoordinate;
		gl_Position = u_worldViewProjection * a_position;
	}
`;



var fragmentShader =
`
	uniform sampler2D texture;
	uniform bool u_lightingEnabled;
	uniform highp vec4 u_ambientColor;
	varying highp vec2 v_textureCoordinate;
	varying highp float v_diffuse;
	precision highp float;

	void main(void)
	{
		vec4 lighting = vec4(1);
		if (u_lightingEnabled)
		{
			lighting = vec4(v_diffuse, v_diffuse, v_diffuse, 1) + u_ambientColor;
		}
		gl_FragColor = texture2D(texture, v_textureCoordinate) * lighting;
	}
`;
