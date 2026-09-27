<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import gsap from 'gsap';

  let canvasContainer: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let frameId: number;
  let mouse = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };

  // Graph objects
  const nodes: THREE.Mesh[] = [];
  const links: THREE.Line[] = [];
  let graphGroup: THREE.Group;
  
  // Dynamic Materials for Theme Swapping
  let centerMaterial: THREE.MeshBasicMaterial;
  let lineMaterial: THREE.LineBasicMaterial;
  let linkMaterial: THREE.LineBasicMaterial;
  let themeObserver: MutationObserver;
  let htmlEl: HTMLHtmlElement;

  onMount(() => {
    // Determine initial theme
    htmlEl = document.documentElement;
    const isDark = htmlEl.getAttribute('data-theme') === 'neoDark' || htmlEl.classList.contains('dark');
    const strokeColor = isDark ? 0xFFFFFF : 0x000000;

    // 1. Scene Setup
    scene = new THREE.Scene();

    // 2. Camera Setup
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.z = 10;

    // 3. Renderer Setup (transparent)
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    // Initialize Shared Materials
    centerMaterial = new THREE.MeshBasicMaterial({ 
      color: strokeColor, 
      transparent: true, 
      opacity: 0.9 
    });
    lineMaterial = new THREE.LineBasicMaterial({ color: strokeColor, linewidth: 2 });
    linkMaterial = new THREE.LineBasicMaterial({ color: strokeColor, linewidth: 2 });

    // 4. Create Node Graph Structure
    graphGroup = new THREE.Group();
    
    const nodeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const colors = [0x3B66FF, 0x10B981, 0xF7C948, 0xFF5A4E]; // Blue, Green, Yellow, Red
    
    // Generate 8 random nodes
    for (let i = 0; i < 8; i++) {
      const isCenter = i === 0;
      
      const material = isCenter ? centerMaterial : new THREE.MeshBasicMaterial({ 
        color: colors[i % colors.length], 
        transparent: true,
        opacity: 0.9 
      });
      
      const node = new THREE.Mesh(nodeGeometry, material);
      
      // Wireframe border
      const edges = new THREE.EdgesGeometry(nodeGeometry);
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      node.add(wireframe);
      
      // Position nodes
      if (isCenter) {
        node.position.set(0, 0, 0);
        node.scale.set(1.5, 1.5, 1.5);
      } else {
        const radius = 3 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        node.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
      }
      
      nodes.push(node);
      graphGroup.add(node);
    }

    // Connect nodes to center and some to each other
    for (let i = 1; i < nodes.length; i++) {
      // Link to center
      const points1 = [nodes[0].position, nodes[i].position];
      const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
      const line1 = new THREE.Line(geometry1, linkMaterial);
      links.push(line1);
      graphGroup.add(line1);
      
      // Link to previous node (create a web)
      if (i > 1 && Math.random() > 0.3) {
        const points2 = [nodes[i-1].position, nodes[i].position];
        const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const line2 = new THREE.Line(geometry2, linkMaterial);
        links.push(line2);
        graphGroup.add(line2);
      }
    }

    scene.add(graphGroup);

    // 5. Initial Animation using GSAP
    graphGroup.scale.set(0, 0, 0);
    
    gsap.to(graphGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.5,
      ease: "back.out(1.5)",
      delay: 0.2
    });

    // Make nodes pulse
    nodes.forEach((node, i) => {
      if (i !== 0) {
        gsap.to(node.position, {
          x: node.position.x * 1.1,
          y: node.position.y * 1.1,
          z: node.position.z * 1.1,
          duration: 2 + Math.random() * 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      }
    });

    gsap.to(graphGroup.rotation, {
      y: "+=6.28", // Full rotation
      x: "+=3.14",
      duration: 30,
      repeat: -1,
      ease: "none"
    });

    // 6. Animation Loop & Parallax
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Update link geometries if nodes move
      let linkIdx = 0;
      for (let i = 1; i < nodes.length; i++) {
        // Center link
        const pos1 = links[linkIdx].geometry.attributes.position as THREE.BufferAttribute;
        pos1.setXYZ(0, nodes[0].position.x, nodes[0].position.y, nodes[0].position.z);
        pos1.setXYZ(1, nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
        pos1.needsUpdate = true;
        linkIdx++;
        
        // Sibling link
        if (i > 1 && linkIdx < links.length) {
          const pos2 = links[linkIdx].geometry.attributes.position as THREE.BufferAttribute;
          pos2.setXYZ(0, nodes[i-1].position.x, nodes[i-1].position.y, nodes[i-1].position.z);
          pos2.setXYZ(1, nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
          pos2.needsUpdate = true;
          linkIdx++;
        }
      }

      // Mouse Parallax effect
      target.x = mouse.x * 0.3;
      target.y = mouse.y * 0.3;
      
      graphGroup.position.x += 0.05 * (target.x * 2 - graphGroup.position.x);
      graphGroup.position.y += 0.05 * (target.y * 2 - graphGroup.position.y);

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Move Listener
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvasContainer.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize Listener
    const onResize = () => {
      if (!canvasContainer || !camera || !renderer) return;
      camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Dynamic Theme Observer
    themeObserver = new MutationObserver(() => {
      const currentDark = document.documentElement.getAttribute('data-theme') === 'neoDark' || document.documentElement.classList.contains('dark');
      const newStrokeColor = currentDark ? 0xFFFFFF : 0x000000;
      centerMaterial.color.setHex(newStrokeColor);
      lineMaterial.color.setHex(newStrokeColor);
      linkMaterial.color.setHex(newStrokeColor);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      themeObserver.disconnect();
    };
  });

  onDestroy(() => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    if (themeObserver) {
      themeObserver.disconnect();
    }
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
    nodes.forEach(node => {
      node.geometry.dispose();
      (node.material as THREE.Material).dispose();
      // Dispose wireframe
      node.children.forEach(child => {
        (child as THREE.LineSegments).geometry.dispose();
      });
    });
    links.forEach(link => {
      link.geometry.dispose();
    });
    if (lineMaterial) lineMaterial.dispose();
    if (linkMaterial) linkMaterial.dispose();
    if (centerMaterial) centerMaterial.dispose();
  });
</script>

<div class="w-full h-full pointer-events-auto cursor-crosshair" bind:this={canvasContainer}></div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>