import objLoader from 'https://cdn.skypack.dev/webgl-obj-loader';
import { vec3, vec4, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

import Transform from './transform.js';

export default class Model
{
	constructor(gl, mesh, color)
	{
		this.gl = gl;
		this.color = color;
		this.mesh = mesh;
		
		this.mesh.indices = [];
		for (let i = 0; i < this.mesh.indicesPerMaterial.length; i++) {
			this.mesh.indices = this.mesh.indices.concat(this.mesh.indicesPerMaterial[i]);
		}
		objLoader.initMeshBuffers(this.gl, this.mesh);
		// console.log(this.mesh);
		// this.color = color;
		// this.vertexAttributesData = new Float32Array();

		this.transform = new Transform(0,0);
		this.colorAttributesBuffer = this.gl.createBuffer();
		// this.resetColor();
		this.colorIDs = [];
		for (let ii = 0; ii < this.mesh.indexBuffer.numItems/3; ++ii) {
			const id = ii+1;
			let cId = [
		        ((id >>  0) & 0xFF) / 0xFF,
		        ((id >>  8) & 0xFF) / 0xFF,
		        ((id >> 16) & 0xFF) / 0xFF,
		        ((id >> 24) & 0xFF) / 0xFF
		     ];
		    this.colorIDs.push(...cId);
		    this.colorIDs.push(...cId);
		    this.colorIDs.push(...cId);
		}
		// console.log(this.colorID);
		this.colorID = new Float32Array(this.colorIDs);

		this.colorArr = [];
		for (let ii = 0; ii < this.mesh.indexBuffer.numItems; ++ii) {
			this.colorArr.push(...this.color);
		}
		this.colorArrF32 = new Float32Array(this.colorArr);
		this.selFaceInd = [-1,-1,-1];
	}

	draw(shader, VPMatrix, isAxes = false, faceSelMode = false)
	{
		// const uSceneTransformMatrix = shader.uniform("uSceneTransformMatrix");

		// let elementPerVertex = 3;

		const aPosition = shader.attribute("aPosition");
		this.gl.enableVertexAttribArray(aPosition);

		// objLoader.initMeshBuffers(this.gl, this.mesh);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
		// this.gl.bufferData(this.gl.ARRAY_BUFFER, this.mesh.vertices, this.gl.STATIC_DRAW);

		this.gl.vertexAttribPointer(aPosition, this.mesh.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);


		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorAttributesBuffer);

		// this.gl.uniform1f(shader.uniform("faceSelMode"), faceSelMode?1:0);
		if(faceSelMode)
		{
			this.colorID = Float32Array.from(this.colorIDs);
			if(this.selFaceInd[0] >= 0){
				this.colorID[this.selFaceInd[0]*4] = 1;
				this.colorID[this.selFaceInd[0]*4 + 1] = 0.4;
				this.colorID[this.selFaceInd[0]*4 + 2] = 0;
				this.colorID[this.selFaceInd[0]*4 + 3] = 1;
				this.colorID[this.selFaceInd[1]*4] = 1;
				this.colorID[this.selFaceInd[1]*4 + 1] = 0.4;
				this.colorID[this.selFaceInd[1]*4 + 2] = 0;
				this.colorID[this.selFaceInd[1]*4 + 3] = 1;
				this.colorID[this.selFaceInd[2]*4] = 1;
				this.colorID[this.selFaceInd[2]*4 + 1] = 0.4;
				this.colorID[this.selFaceInd[2]*4 + 2] = 0;
				this.colorID[this.selFaceInd[2]*4 + 3] = 1;
			}
			this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colorID, this.gl.DYNAMIC_DRAW);
		}else{
			this.colorArrF32 = Float32Array.from(this.colorArr);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colorArrF32, this.gl.DYNAMIC_DRAW);

		}


		const aColor = shader.attribute("aColor");
		this.gl.enableVertexAttribArray(aColor);
		this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 0, 0);
		
		const uMVPMatrix = shader.uniform("uMVPMatrix");
		
		if(isAxes){
			shader.setUniformMatrix4fv(uMVPMatrix, this.transform.getMVPMatrix());
		}else{
			const MVPMatrix = mat4.create();
			mat4.multiply(MVPMatrix, VPMatrix, this.transform.getMVPMatrix());
			shader.setUniformMatrix4fv(uMVPMatrix, MVPMatrix);
		}


		// const uColor = shader.uniform("uColor");
		// shader.setUniform4f(uColor, this.color);


		// shader.setUniformMatrix4fv(uSceneTransformMatrix, sceneTransformMatrix);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
		// this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.indices, this.gl.STATIC_DRAW);

		this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
	// this.gl.drawArrays(this.gl.TRIANGLES, 0, this.mesh.vertices.length/3);
	}

	setColor(color){
		this.color = color;
		this.colorArr = [];
		for (let ii = 0; ii < this.mesh.indexBuffer.numItems; ++ii) {
			this.colorArr.push(...this.color);
		}
	}

	resetColor(){
		this.setColor(this.color);
	}

	addVertex(position, color)
	{
		this.vertexAttributesData = new Float32Array([...this.vertexAttributesData, ...position, ...color])
	}

	getPos(i){
		return this.transform.getTranslate()[i];
	}
}