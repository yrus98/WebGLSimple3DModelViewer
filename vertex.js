const vertexShaderSrc = `      
        attribute vec3 aPosition;
        attribute vec4 aColor;  
        uniform mat4 uMVPMatrix;

        // uniform float faceSelMode;
        // uniform vec4 uColor;
        // uniform mat4 uProject;
        // uniform mat4 uView;

        // varying vec3 vPos;
        varying vec4 vColor;

        void main () {             
           
          // gl_Position = uProject * uView * uModelTransformMatrix * vec4(aPosition, 1.0); 
          gl_Position = uMVPMatrix * vec4(aPosition, 1.0); 
          vColor = aColor;

          // vPos = vec3(gl_Position.x, gl_Position.y, gl_Position.z);
		  // gl_PointSize = 5.0;   
          // vColor = (faceSelMode==1.0)?aColor:uColor;  
        }                          
	  `;

export default vertexShaderSrc;
