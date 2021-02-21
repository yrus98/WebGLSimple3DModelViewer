const fragmentShaderSrc = `      
		precision mediump float;
		// uniform vec4 uColor;   

		// varying vec3 vPos;
		varying vec4 vColor;

        void main () {               
          // gl_FragColor = vec4(uColor.x, uColor.y, uColor.z, uColor.w);
          gl_FragColor = vColor;
        }                            
	  `;

export default fragmentShaderSrc;
