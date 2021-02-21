import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export default class Transform
{
	constructor(centerX, centerY)
	{
		this.translate = vec3.fromValues(centerX, centerY, 0);
		this.scale = vec3.fromValues(1, 1, 1);
		this.rotationAngle = 0;
		this.rotationAxis = vec3.fromValues( 0, 1, 0);

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);

		this.updateMVPMatrix();
		this.viewMatrix = mat4.create();
		mat4.lookAt(this.viewMatrix, vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

	}

	getMVPMatrix()
	{
		return this.modelTransformMatrix;
	}

	updateMVPMatrix()
	{
		mat4.identity(this.modelTransformMatrix);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngle, this.rotationAxis);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
	}

	updateMVPMatrixForAxes(sceneRotations, lastRot)
	{
		mat4.identity(this.modelTransformMatrix);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, vec3.fromValues(-0.8,0.6,0.2));


		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[0], vec3.fromValues(1,0,0));
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[1], vec3.fromValues(0,1,0));
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[2], vec3.fromValues(0,0,1));

		// let tempXAxis = vec3.create();
		// let tempYAxis = vec3.create();
		// let tempZAxis = vec3.create();
		// vec3.rotateZ(tempYAxis, vec3.fromValues(0,1,0), vec3.fromValues(0,0,0), sceneRotations[2]);
		// vec3.rotateX(tempYAxis, tempYAxis, vec3.fromValues(0,0,0), sceneRotations[0]);


		// vec3.rotateY(tempXAxis, vec3.fromValues(1,0,0), vec3.fromValues(0,0,0), sceneRotations[1]);
		// vec3.rotateZ(tempXAxis, tempXAxis, vec3.fromValues(0,0,0), sceneRotations[2]);

		// vec3.rotateX(tempZAxis, vec3.fromValues(0,0,1), vec3.fromValues(0,0,0), sceneRotations[0]);
		// vec3.rotateY(tempZAxis, tempZAxis, vec3.fromValues(0,0,0), sceneRotations[1]);

		// mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[0], tempXAxis);
		// mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[1], tempYAxis);
		// mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[2], tempZAxis);


		// let rotAxes = [vec3.fromValues(1,0,0), vec3.fromValues(0,1,0), vec3.fromValues(0,0,1)];
		// for (let i = 0; i < 3; i++) {
		// 	if(i!=lastRot)
		// 		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[i], rotAxes[i]);			
		// }
		// mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, sceneRotations[lastRot], rotAxes[lastRot]);			

		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngle, this.rotationAxis);

		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);

		mat4.multiply(this.modelTransformMatrix, this.viewMatrix, this.modelTransformMatrix);
	}

	setTranslate(translationVec)
	{
		vec3.copy(this.translate, translationVec);
	}

	getTranslate()
	{
		return this.translate;
	}

	setScale(scalingVec)
	{
		vec3.copy(this.scale, scalingVec);
	}

	getScale()
	{
		return this.scale[0];
	}

	setRotate(rotationAngle, rotationAxis)
	{
		this.rotationAngle = rotationAngle;
		vec3.copy(this.rotationAxis, rotationAxis);
	}

	getRotate()
	{
		return this.rotationAngle;
	}
}