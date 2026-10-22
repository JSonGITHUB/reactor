import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Animation = () => {
    const mountRef = useRef(null);
    const frameIdRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const mountNode = mountRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 10);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        mountNode.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xff6b35, 1);
        sunLight.position.set(0, -5, 0);
        sunLight.castShadow = true;
        scene.add(sunLight);

        // Sky gradient
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0a0a1e) },
                bottomColor: { value: new THREE.Color(0xff6b35) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(sky);

        // Sun
        const sunGeometry = new THREE.SphereGeometry(12, 32, 32);
        const sunMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffa500,
            emissive: 0xffa500,
            emissiveIntensity: 1
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(0, -5, -30);
        scene.add(sun);

        // Sun glow
        const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0xff6b35) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGlow.position.copy(sun.position);
        scene.add(sunGlow);

        // Ocean
        const oceanGeometry = new THREE.PlaneGeometry(200, 200, 128, 128);
        const oceanMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                sunPosition: { value: sun.position },
                oceanColor: { value: new THREE.Color(0x00ffff) },
                sunColor: { value: new THREE.Color(0xff6b35) }
            },
            vertexShader: `
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
            `,
            fragmentShader: `
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
            `,
            side: THREE.DoubleSide
        });
        
        const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.y = -2;
        ocean.receiveShadow = true;
        scene.add(ocean);

        // Animation parameters
        let time = 0;
        const sunriseSpeed = 0.01;

        // Animation loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            
            time += 0.016;
            oceanMaterial.uniforms.time.value = time;
            
            // Sunrise animation
            if (sun.position.y < 10) {
                sun.position.y += sunriseSpeed;
                sunGlow.position.y = sun.position.y;
                sunLight.position.y = sun.position.y;
                
                // Update sky colors as sun rises
                const sunProgress = (sun.position.y + 5) / 15;
                skyMaterial.uniforms.bottomColor.value.setHSL(0.05, 0.8, 0.3 + sunProgress * 0.4);
                skyMaterial.uniforms.topColor.value.setHSL(0.6, 0.8, 0.1 + sunProgress * 0.4);
                
                // Update sun color
                sunMaterial.color.setHSL(0.1, 1, 0.5 + sunProgress * 0.3);
                ambientLight.intensity = 0.3 + sunProgress * 0.5;
            }
            
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
            if (mountNode && renderer.domElement) {
                mountNode.removeChild(renderer.domElement);
            }
            renderer.dispose();
            oceanGeometry.dispose();
            oceanMaterial.dispose();
            skyGeometry.dispose();
            skyMaterial.dispose();
            sunGeometry.dispose();
            sunMaterial.dispose();
            glowGeometry.dispose();
            glowMaterial.dispose();
        };
    }, []);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100vw', 
                height: '100vh', 
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0
            }} 
        />
    );
};

export default Animation;