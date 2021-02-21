import { vec3, vec4, mat4 } from 'https://cdn.skypack.dev/gl-matrix';
import objLoader from 'https://cdn.skypack.dev/webgl-obj-loader';

import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import Transform from './transform.js'
import Model from './model.js';

let controlBtn = document.getElementById('modeBtn');
// let controlModeNames = ['Drawing','Instance-Transformation','Scene-Transformation'];
let selBtn = document.getElementById('selBtn');
let axisBtn = document.getElementById('axisBtn');
let axisLabels = ['X','Y','Z'];
// let shapeNames = ['Rectangle','Square','Circle'];
let resetBtn = document.getElementById('resetBtn');
let keyRecordiv = document.getElementById('keyRecord');
let selMode = 'o';
let renMode = 'o';


const renderer = new Renderer();
const gl = renderer.webGlContext();
const canvas = renderer.getCanvas();

const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
shader.use();

const models = [];
const axes = [];

const initModelScales = [];
const initColors = [];
const initColorsSum = [];
const primColors = [vec4.fromValues(1,1,0,1), vec4.fromValues(0,1,1,1), vec4.fromValues(1,0.5,0.5,1)];


let controlMode = 0;
let shapeMode = 0;

let currActiveModelIndex = -1;

// const gui = new dat.GUI();

let translation = vec3.create();
let rotationAngle = 0;
let rotationAxis = vec3.create();
let scale = vec3.create();

let globCenterX = 0, globCenterY = 0;
let globalTransform = new Transform(0,0);
let sceneTransformMatrix = mat4.create();

// const transformSettings = {
// 	translateX :0.0,
// 	translateY :0.0,
// 	scale :1.0,
// 	rotationAngle: 0
// };
// let scaleCon = gui.add(transformSettings, 'scale', 0.0, 2.0, 0.02);

const VPMatrix = mat4.create();
const projectMatrix = mat4.create();
const viewMatrix = mat4.create();
let triangleVertices = [0.5, 0, 0,
						-0.25, 0, -0.433,
						-0.25, 0, 0.433];
let drawTriangle = false;

let globMouseX = 0, globMouseY = 0;
let isMouseDragging = false;
let lastX = -1, lastY = -1;
let camRotationAngles = [0,0,0];
let selRotationAxis = 1;
const rotAxes = [vec3.fromValues(1,0,0), vec3.fromValues(0,1,0), vec3.fromValues(0,0,1)];

let rotOrders = [0,1,2];
let lastRot = 2;

let pixValueBuf = new Uint8Array(4);

canvas.onmousedown = mousedown;
canvas.onmouseup = mouseup;
canvas.onmousemove = mousemove;




window.onload = function(){
	
	fetch('./Models/axes.obj')
		  .then(response => response.text())
		  .then(text => {

		  	// X-axis
		  	let mesh = new objLoader.Mesh(text);
			let model = new Model(gl, mesh, vec4.fromValues(1.0, 0, 0, 1.0))
			model.transform.setRotate(-Math.PI/2, vec3.fromValues(0, 0, 1.0));
			vec3.set(scale, 0.15, 0.15, 0.15);
			model.transform.setScale(scale);
			axes.push(model);

			//Y-axis
			mesh = new objLoader.Mesh(text);
			model = new Model(gl, mesh, vec4.fromValues(0,1.0,0,1.0))
			model.transform.setScale(scale);
			axes.push(model);

			//Z-axis
			mesh = new objLoader.Mesh(text);
			model = new Model(gl, mesh, vec4.fromValues(0,0,1.0,1.0))
			model.transform.setRotate(-Math.PI/2, vec3.fromValues(-1.0,0,0));
			model.transform.setScale(scale);
			axes.push(model);
	});
	fetch('./Models/Puppy.obj')
		  .then(response => response.text())
		  .then(text => {
			let mesh = new objLoader.Mesh(text);
			let model = new Model(gl, mesh, vec4.fromValues(1,0.8,0,1.0))
			vec3.set(scale, 0.03, 0.03, 0.03);
			model.transform.setScale(scale);
			models.push(model);
			initModelScales.push(0.03);
			initColors.push(vec4.fromValues(1,0.8,0,1.0));
			initColorsSum.push(1.8*255);
	});
	fetch('./Models/Lowpoly_tree_sample.obj')
		  .then(response => response.text())
		  .then(text => {
			let mesh = new objLoader.Mesh(text);
			let model = new Model(gl, mesh, vec4.fromValues(0,0.6,0,1.0))
			vec3.set(scale, 0.02, 0.02, 0.02);
			model.transform.setScale(scale);
			models.push(model);
			initModelScales.push(0.02);
			initColors.push(vec4.fromValues(0,0.6,0,1.0));
			initColorsSum.push(0.6*255);

			console.log(model);

	});
	fetch('./Models/among_us.obj')
		  .then(response => response.text())
		  .then(text => {
			let mesh = new objLoader.Mesh(text);
			let model = new Model(gl, mesh, vec4.fromValues(0.5,0.2,0.5,1.0))
			vec3.set(scale, 0.08,0.08,0.08);
			model.transform.setScale(scale);
			models.push(model);
			initModelScales.push(0.08);
			initColors.push(vec4.fromValues(0.5,0.2,0.5,1.0));
			initColorsSum.push(1.2*255);
	});
	selBtn.style.display = 'none';
	axisBtn.style.display = 'none';
};

function mousedown(event) {

	let mouseX = event.clientX;
	let mouseY = event.clientY;

	let rect = renderer.getCanvas().getBoundingClientRect();
	mouseX = mouseX - rect.left;
	mouseY = mouseY - rect.top;
	lastX = mouseX;
	lastY = mouseY;
	const clipCoordinates = renderer.mouseToClipCoord(mouseX,mouseY);
	isMouseDragging = true;
	if(controlMode == 'h'){
		
		if(selMode == 'o'){
			//Object selection Mode
			gl.readPixels(mouseX, canvas.height - mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixValueBuf);
			console.log(pixValueBuf);
			if(currActiveModelIndex != -1){
				models[currActiveModelIndex].setColor(initColors[currActiveModelIndex]);
				currActiveModelIndex = -1;
			}
			let pixValueSum = pixValueBuf[0] + pixValueBuf[1] + pixValueBuf[2];
			for (let i = 0; i < 3; i++) {
				if(Math.abs(initColorsSum[i] - pixValueSum)<=2){
					currActiveModelIndex = i;
					models[i].setColor(vec4.fromValues(1,0.4,0,1));
				}
			}
		}else{
			//Face Mode
			if(currActiveModelIndex != -1){
				// models[currActiveModelIndex].draw(shader, VPMatrix, false, true);
				globMouseX = mouseX;
				globMouseY = mouseY;
				renMode = 'f';
				// models[currActiveModelIndex].draw(shader, VPMatrix);
				gl.readPixels(globMouseX, canvas.height - globMouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixValueBuf);
				console.log(pixValueBuf);
				const id = -1 + pixValueBuf[0] + (pixValueBuf[1] << 8) + (pixValueBuf[2] << 16) + (pixValueBuf[3] << 24);
				models[currActiveModelIndex].selFaceInd = [id*3, id*3 + 1, id*3 + 2];
				renMode = 'o';

			}
		}
	}

}

function mouseup(event) {
	isMouseDragging = false;
}

function mousemove(event) {
	let mouseX = event.clientX;
	let mouseY = event.clientY;
	if (isMouseDragging && controlMode == 'i') {
		// The rotation speed factor
		// dx and dy here are how for in the x or y direction the mouse moved
		let factor = 10/canvas.height;
		let dx = factor * (mouseX - lastX);
		// let dy = factor * (mouseY - lastY);

		// update the latest angle
		// sceneAngleX += dy;
		camRotationAngles[selRotationAxis] += dx;
	}
	// update the last mouse position
	lastX = mouseX;
	lastY = mouseY;
}

// Convert mouse click to coordinate system as understood by webGL
// renderer.getCanvas().addEventListener('click', (event) =>
// {
// 	// captImageBtn.setAttribute('href', gl.canvas.toDataURL("image/jpeg", 1));
	
// 	let mouseX = event.clientX;
// 	let mouseY = event.clientY;

// 	let rect = renderer.getCanvas().getBoundingClientRect();
// 	mouseX = mouseX - rect.left;
// 	mouseY = mouseY - rect.top;

// 	const clipCoordinates = renderer.mouseToClipCoord(mouseX,mouseY);

	
// });

window.addEventListener('keydown', function (event){
	keyRecord.innerHTML = event.key;
	switch(event.key){
		case 'C':
		case 'c':
			stepC();
			break;
		case 'D':
		case 'd':
			stepD();
			break;
		case 'E':
		case 'e':
			stepE();
			break;
		case 'F':
		case 'f':
			stepF();
			break;
		case 'G':
		case 'g':
			stepG();
			break;
		case 'H':
		case 'h':
			controlMode = 'h';
			break;
		case 'I':
		case 'i':
			controlMode = 'i';
			break;
		case 'X':
		case 'x':
			if(controlMode == 'i')	selRotationAxis = 0;
			break;
		case 'Y':
		case 'y':
			if(controlMode == 'i')	selRotationAxis = 1;
			break;
		case 'Z':
		case 'z':
			if(controlMode == 'i')	selRotationAxis = 2;
			break;
		case 'Tab':
			selMode = (selMode=='o' && currActiveModelIndex!=-1)? 'f': 'o'; //Toggle selection Modes 
			break;

	}
	if(controlMode == 'h')
		selBtn.style.display='';
	else
		selBtn.style.display='none';
	if(controlMode == 'i')
		axisBtn.style.display='';
	else
		axisBtn.style.display='none';
	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();
	selBtn.innerHTML = 'Selection : ' + ((selMode=='o')?'Object':'Face');
	axisBtn.innerHTML = 'Rotation Axis : ' + axisLabels[selRotationAxis];
}, true);

// modeBtn.addEventListener("click", changeControlMode); 
selBtn.addEventListener("click", changeSelectionMode); 
axisBtn.addEventListener("click", changeRotationAxis); 
resetBtn.addEventListener("click", stepC); 



function changeRotationAxis(){
	selRotationAxis = (selRotationAxis + 1)%3;
	axisBtn.innerHTML = 'Rotation Axis : ' + axisLabels[selRotationAxis];

}

function changeSelectionMode(){
	selMode = (selMode=='o' && currActiveModelIndex!=-1)? 'f': 'o';
	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();
	selBtn.innerHTML = 'Selection : ' + ((selMode=='o')?'Object':'Face');

}

function res(){
	models.splice(0, models.length);
}

//Draw loop
function animate()
{
	renderer.clear();
	mat4.identity(VPMatrix);
	mat4.rotate(VPMatrix, VPMatrix, camRotationAngles[0], rotAxes[0]);
	mat4.rotate(VPMatrix, VPMatrix, camRotationAngles[1], rotAxes[1]);
	mat4.rotate(VPMatrix, VPMatrix, camRotationAngles[2], rotAxes[2]);
	mat4.perspective(projectMatrix, Math.PI/2, 4 / 3, 1 / 256, 256);
	mat4.lookAt(viewMatrix, vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

	mat4.multiply(VPMatrix, viewMatrix, VPMatrix);
	mat4.multiply(VPMatrix, projectMatrix, VPMatrix);

	axes.forEach(function(axis, index, arr){
		axis.transform.updateMVPMatrixForAxes(camRotationAngles, selRotationAxis);
		axis.draw(shader, VPMatrix, true);
	});

	if(drawTriangle == true){

		//Draw the triangle
		let aPosition = shader.attribute("aPosition");
		gl.enableVertexAttribArray(aPosition);


		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
		
		let uMVPMatrix = shader.uniform("uMVPMatrix");
		// mat4.multiply(MVPMatrix, viewMatrix, this.transform.getMVPMatrix());
		// mat4.multiply(MVPMatrix, projectMatrix, MVPMatrix);

		shader.setUniformMatrix4fv(uMVPMatrix, VPMatrix);

		let uColor = shader.uniform("uColor");
		shader.setUniform4f(uColor, vec4.fromValues(0,0,0,1));
		gl.drawArrays(gl.LINE_LOOP, 0, 3);

	}
	
	models.forEach(function(model, index, arr){
		// console.log(models.length);
		// let scaleGUIValue = scaleCon.getValue();
		// vec3.set(scale, scaleGUIValue, scaleGUIValue, scaleGUIValue);
		// model.transform.setScale(scale);

		model.transform.updateMVPMatrix();
		if(selMode == 'f' && currActiveModelIndex==index){
			model.draw(shader, VPMatrix, false, true);
			
		}
		else
			model.draw(shader, VPMatrix);
	
	});

	

	window.requestAnimationFrame(animate);
}

animate();
shader.delete();


function stepC(){
	controlMode = 'c';
	models.forEach(function(model, index, arr){
		model.transform.setTranslate(vec3.fromValues(0,0,0));
		model.transform.setScale(vec3.fromValues(initModelScales[index],initModelScales[index],initModelScales[index]));
		model.transform.setRotate(0, vec3.fromValues(0,1,0));	
	});
	drawTriangle = false;
	camRotationAngles = [0,0,0];
	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();

}

function stepD(){
	controlMode = 'd';
	models.forEach(function(model, index, arr){
		let temp = vec3.fromValues(triangleVertices[index * 3], triangleVertices[index * 3 + 1], triangleVertices[index * 3 + 2]);
		model.transform.setTranslate(temp);	
	});

	drawTriangle = true;
	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();

}


function stepE(){
	controlMode = 'e';		
	let midTriangleVertices = [];
	for (let i = 0; i < 3; i++) {
		let vertX = 0, vertY= 0 , vertZ = 0;
		vertX = (triangleVertices[3*i] + triangleVertices[3 * ((i+1)%3)]) / 2;
		vertY = (triangleVertices[3*i+1] + triangleVertices[3 * ((i+1)%3) + 1]) / 2;
		vertZ = (triangleVertices[3*i+2] + triangleVertices[3 * ((i+1)%3) + 2]) / 2;
		midTriangleVertices.push(vertX, vertY, vertZ);
	}
	console.log(midTriangleVertices);
	console.log(triangleVertices);
	
	models.forEach(function(model, index, arr){
		let temp = vec3.fromValues(midTriangleVertices[index * 3], midTriangleVertices[index * 3 + 1], midTriangleVertices[index * 3 + 2]);
		model.transform.setTranslate(temp);	
	});

	drawTriangle = true;
	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();

}


function stepF(){
	controlMode = 'f';
	let theta = models[0].transform.getRotate() + Math.PI/2;
	models[0].transform.setRotate(theta, vec3.fromValues(0,1,0));
	theta = models[1].transform.getRotate() + Math.PI/2;
	models[1].transform.setRotate(theta, vec3.fromValues(0,0,1));
	theta = models[2].transform.getRotate() + Math.PI/2;
	models[2].transform.setRotate(theta, vec3.fromValues(1,0,0));
	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();

}


function stepG(){
	controlMode = 'g';
	let scl = 1;
	scl = 0.5 * models[0].transform.getScale();
	models[0].transform.setScale(vec3.fromValues(scl,scl,scl));
	
	scl = 2 * models[1].transform.getScale();
	models[1].transform.setScale(vec3.fromValues(scl,scl,scl));
	
	scl = 3 * models[2].transform.getScale();
	models[2].transform.setScale(vec3.fromValues(scl,scl,scl));

	controlBtn.innerHTML = 'Mode : ' + controlMode.toLocaleUpperCase();

}
