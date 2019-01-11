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
	lightIntensity: 0,
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

	cameraPosition: vec3.create(),
	cameraRotationX: 0,
	cameraRotationY: 0,
	cameraDistance: 0,
	cameraDistanceDelta: 0,

	sunObject: null,
	sunTexture: null,
	sunFlareObject: null,
	sunFlareTexture: null,

	planetObject: null,
	atmosphereObject: null,
	moonObject: null,
	discObject: null,

	venusTexture: null,
	earthTexture: null,
	marsTexture: null,
	jupiterTexture: null,
	saturnTexture: null,
	moonTexture: null,
	atmosphereTexture: null,

	intensityRange: null,
	sliderAmbienceRed: null,
	sliderAmbienceGreen: null,
	sliderAmbienceBlue: null,

	paused: false
};



function main(context)
{
	gl = context;


	shared.intensityRange = document.getElementById("rangeIntensity");
	shared.sliderAmbienceRed = document.getElementById("rangeAmbienceRed");
	shared.sliderAmbienceBlue = document.getElementById("rangeAmbienceBlue");
	shared.sliderAmbienceGreen = document.getElementById("rangeAmbienceGreen");

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
	shared.cameraDistance = 80;

	shared.sunObject = twgl.primitives.createSphereBufferInfo(gl, 5, 32, 32);
	shared.sunFlareObject = twgl.primitives.createPlaneBufferInfo(gl, 55, 55);
	shared.sunTexture = loadTexture("2k_sun.jpg");
	shared.sunFlareTexture = loadTexture("lensflare.png");

	shared.planetObject = twgl.primitives.createSphereBufferInfo(gl, 4, 32, 32);
	shared.atmosphereObject = twgl.primitives.createSphereBufferInfo(gl, 4.2, 33, 33);
	shared.moonObject = twgl.primitives.createSphereBufferInfo(gl, 1, 8, 8);
	shared.discObject = twgl.primitives.createDiscBufferInfo(gl, 10, 20, 1, 5);

	shared.venusTexture = loadTexture("2k_venus_surface.jpg");
	shared.earthTexture = loadTexture("2k_earth_daymap.jpg");
	shared.marsTexture = loadTexture("2k_mars.jpg");
	shared.jupiterTexture = loadTexture("2k_jupiter.jpg");
	shared.saturnTexture = loadTexture("2k_saturn.jpg");
	shared.moonTexture = loadTexture("2k_moon.jpg");
	shared.atmosphereTexture = loadTexture("2k_earth_clouds.jpg");
}

function lightIntensityChange()
{
		shared.lightIntensity = shared.intensityRange.value;
}

function AmbienceRedChange ()
{
    shared.ambienceRed = shared.sliderAmbienceRed.value;
}

function AmbienceGreenChange ()
{
    shared.ambienceGreen = shared.sliderAmbienceGreen.value;
}

function AmbienceBlueChange ()
{
    shared.ambienceBlue = shared.sliderAmbienceBlue.value;
}

function drawScene(time)
{
	shared.lightIntensity = 1;
	//shared.ambientColor = vec4.fromValues(shared.ambienceRed, shared.ambienceGreen, shared.ambienceBlue, 1);
	shared.ambientColor = vec4.fromValues(0.2, 0.2, 0.2, 1);
	shared.lightPosition = vec4.fromValues(0, 0, 0, 1);

	var world = shared.worldMatrix;

	mat4.identity(world);

	// 0
	// Venus
	pushWorldMatrix(); // 1
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(20, 0, 0));
	mat4.scale(world, world, vec3.fromValues(1.1,1.1,1.1));

	mat4.rotateY(world, world, shared.time * 0.001);
	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.venusTexture);
	drawObject(shared.planetObject);

	popWorldMatrix(); // 0

	// Earth
	pushWorldMatrix(); // 1
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(-20,0,0));
	mat4.rotateY(world, world, shared.time * 0.001);

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.earthTexture);
	drawObject(shared.planetObject);

	mat4.rotateY(world, world, shared.time * -0.002);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	// Earth atmosphere

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.atmosphereTexture);
	drawObject(shared.atmosphereObject);

	gl.disable(gl.BLEND);

	// Earth Moon
	pushWorldMatrix(); // 2

	mat4.translate(world, world, vec3.fromValues(-7,0,0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.moonObject);

	popWorldMatrix(); // 1
	popWorldMatrix(); // 0

	// Mars
	pushWorldMatrix(); // 1
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(40,0,0));
	mat4.scale(world, world, vec3.fromValues(0.6,0.6,0.6));
	mat4.rotateY(world, world, shared.time * 0.001);

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.marsTexture);
	drawObject(shared.planetObject);
	mat4.rotateY(world, world, shared.time * 0.001);


	// Mars moon1
	pushWorldMatrix(); // 2

	mat4.translate(world, world, vec3.fromValues(6,0,0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.moonObject);

	popWorldMatrix(); // 1

	mat4.rotateY(world, world, shared.time * -0.006);

	// Mars moon2
	pushWorldMatrix(); // 2
	mat4.translate(world, world, vec3.fromValues(-10,0,0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.moonObject);

	popWorldMatrix(); // 1
	popWorldMatrix(); // 0

	// Jupiter
	pushWorldMatrix(); // 1
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(-50,0,0));
	mat4.scale(world, world, vec3.fromValues(1.6,1.6,1.6));
	mat4.rotateY(world, world, shared.time * 0.001);

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.jupiterTexture);
	drawObject(shared.planetObject);
	mat4.rotateY(world, world, shared.time * -0.001);


	// Jupiters moon1 X
	pushWorldMatrix(); // 2
	mat4.rotateX(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(0,6,0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.moonObject);

	popWorldMatrix(); // 1

	// Jupiter moon2 Y
	pushWorldMatrix(); // 2
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(6,0,0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.moonObject);

	popWorldMatrix(); // 1

	// Jupiter moon3
	pushWorldMatrix(); // 2
	mat4.rotateZ(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(0,9,0));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.moonObject);

	popWorldMatrix(); // 1
	popWorldMatrix(); // 0

	// Saturn
	pushWorldMatrix(); // 1
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.translate(world, world, vec3.fromValues(60,0,0));
	mat4.rotateX(world, world, 0.3);
	mat4.rotateY(world, world, shared.time * 0.001);
	mat4.scale(world, world, vec3.fromValues(1.4,1.5,1.4));

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.saturnTexture);
	drawObject(shared.planetObject);

	mat4.rotateY(world, world, shared.time * -0.001);
	// Saturn ring
	pushWorldMatrix(); // 2
	mat4.rotateY(world, world, shared.time * -0.001);


	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.discObject);
	mat4.rotateY(world, world, shared.time * -0.001);

	mat4.rotateX(world, world, 3,14159);

	mat4.rotateY(world, world, shared.time * 0.001);

	setTransformationAndLighting(true);
	gl.bindTexture(gl.TEXTURE_2D, shared.moonTexture);
	drawObject(shared.discObject);

	mat4.rotateY(world, world, shared.time * 0.001);

	popWorldMatrix(); // 1
	popWorldMatrix(); // 0

	drawSun();
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
		case "ArrowUp":
			shared.cameraDistanceDelta = -5;
			break;
		case "ArrowDown":
			shared.cameraDistanceDelta = 5;
			break;
	}
}



function keyup(event)
{
	switch (event.key)
	{
		case "ArrowUp":
		case "ArrowDown":
			shared.cameraDistanceDelta = 0;
			break;
	}
}



function mousemove(event)
{
	if (event.buttons == 1)
	{
		shared.cameraRotationX += -event.movementY * 0.01;
		shared.cameraRotationY += event.movementX * 0.01;

		var limitAngleX = Math.PI / 3;
		shared.cameraRotationX = Math.max(shared.cameraRotationX, -limitAngleX);
		shared.cameraRotationX = Math.min(shared.cameraRotationX, limitAngleX);
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

	shared.cameraDistance += shared.cameraDistanceDelta * deltaTime * 35;
	vec3.set(shared.cameraPosition, 0, 0, -shared.cameraDistance);
	vec3.rotateX(shared.cameraPosition, shared.cameraPosition, vec3.fromValues(0, 0, 0), shared.cameraRotationX);
	vec3.rotateY(shared.cameraPosition, shared.cameraPosition, vec3.fromValues(0, 0, 0), shared.cameraRotationY);
	mat4.lookAt(shared.viewMatrix, shared.cameraPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
	mat4.multiply(shared.viewProjectionMatrix, shared.projectionMatrix, shared.viewMatrix);

	drawScene(time);

	if (shared.worldMatrixStack.length > 0)
	{
		console.log("worldMatrixStack: Push and pop misalignment");
		shared.run = false;
	}
}



function drawSun()
{
	var world = shared.worldMatrix;

	setTransformationAndLighting(false);
	gl.bindTexture(gl.TEXTURE_2D, shared.sunTexture);
	drawObject(shared.sunObject);

	billboardTransformation(shared.billboardMatrix, shared.viewMatrix);
	mat4.rotateX(world, world, Math.PI/2);
	mat4.multiply(world, shared.billboardMatrix, world);

	setTransformationAndLighting(false);
	gl.bindTexture(gl.TEXTURE_2D, shared.sunFlareTexture);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	drawObject(shared.sunFlareObject);
	gl.disable(gl.BLEND);
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
