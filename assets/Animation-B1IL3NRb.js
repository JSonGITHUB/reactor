import{r as f,G as N}from"./vendor-CEJ1YD2u.js";import{S as G,P as E,W as A,A as F,D as H,a as g,b as h,B as R,C as t,M as c,c as j,d as V,F as _,e as k,f as B}from"./vendor-3d-KzpzPIXj.js";const J=()=>{const v=f.useRef(null),m=f.useRef(null);return f.useEffect(()=>{if(!v.current)return;const d=v.current,i=new G,n=new E(75,window.innerWidth/window.innerHeight,.1,1e3);n.position.set(0,2,10),n.lookAt(0,0,0);const o=new A({antialias:!0});o.setSize(window.innerWidth,window.innerHeight),o.shadowMap.enabled=!0,d.appendChild(o.domElement);const y=new F(1710638,.3);i.add(y);const r=new H(16739125,1);r.position.set(0,-5,0),r.castShadow=!0,i.add(r);const x=new g(500,32,32),s=new h({uniforms:{topColor:{value:new t(657950)},bottomColor:{value:new t(16739125)},offset:{value:33},exponent:{value:.6}},vertexShader:`
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,fragmentShader:`
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,side:R}),D=new c(x,s);i.add(D);const C=new g(12,32,32),w=new j({color:16753920,emissive:16753920,emissiveIntensity:1}),e=new c(C,w);e.position.set(0,-5,-30),i.add(e);const P=new g(3,32,32),S=new h({uniforms:{glowColor:{value:new t(16739125)},viewVector:{value:n.position}},vertexShader:`
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,fragmentShader:`
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,side:_,blending:V,transparent:!0}),u=new c(P,S);u.position.copy(e.position),i.add(u);const M=new k(200,200,128,128),p=new h({uniforms:{time:{value:0},sunPosition:{value:e.position},oceanColor:{value:new t(65535)},sunColor:{value:new t(16739125)}},vertexShader:`
                uniform float time;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vPosition = position;
                    vec3 pos = position;
                    
                    // Wave animation
                    float wave1 = sin(pos.x * 0.1 + time) * 0.5;
                    float wave2 = sin(pos.y * 0.15 + time * 1.3) * 0.3;
                    float wave3 = sin((pos.x + pos.y) * 0.08 + time * 0.8) * 0.4;
                    
                    pos.z = wave1 + wave2 + wave3;
                    
                    // Calculate normal for lighting
                    vec3 tangent = vec3(1.0, 0.0, cos(pos.x * 0.1 + time) * 0.05);
                    vec3 bitangent = vec3(0.0, 1.0, cos(pos.y * 0.15 + time * 1.3) * 0.045);
                    vNormal = normalize(cross(tangent, bitangent));
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,fragmentShader:`
                uniform vec3 sunPosition;
                uniform vec3 oceanColor;
                uniform vec3 sunColor;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vec3 lightDir = normalize(sunPosition - vPosition);
                    float diff = max(dot(vNormal, lightDir), 0.0);
                    
                    // Specular reflection (sun on water)
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 reflectDir = reflect(-lightDir, vNormal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                    
                    vec3 ambient = oceanColor * 0.3;
                    vec3 diffuse = oceanColor * diff * 0.5;
                    vec3 specular = sunColor * spec * 0.8;
                    
                    vec3 finalColor = ambient + diffuse + specular;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,side:B}),a=new c(M,p);a.rotation.x=-Math.PI/2,a.position.y=-2,a.receiveShadow=!0,i.add(a);let b=0;const L=.01,z=()=>{if(m.current=requestAnimationFrame(z),b+=.016,p.uniforms.time.value=b,e.position.y<10){e.position.y+=L,u.position.y=e.position.y,r.position.y=e.position.y;const l=(e.position.y+5)/15;s.uniforms.bottomColor.value.setHSL(.05,.8,.3+l*.4),s.uniforms.topColor.value.setHSL(.6,.8,.1+l*.4),w.color.setHSL(.1,1,.5+l*.3),y.intensity=.3+l*.5}o.render(i,n)};z();const W=()=>{n.aspect=window.innerWidth/window.innerHeight,n.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",W),()=>{window.removeEventListener("resize",W),m.current&&cancelAnimationFrame(m.current),d&&o.domElement&&d.removeChild(o.domElement),o.dispose(),M.dispose(),p.dispose(),x.dispose(),s.dispose(),C.dispose(),w.dispose(),P.dispose(),S.dispose()}},[]),N.jsx("div",{ref:v,style:{width:"100vw",height:"100vh",overflow:"hidden",position:"fixed",top:0,left:0}})};export{J as default};
