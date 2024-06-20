import { loadGLTF, loadAudio } from "../libs/loader";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {
        // Create a new MindARThree instance and configure it
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: '../assets/targets/adidas/adidasSamba.mind'
        });

        // Extract the renderer, scene, and camera from the MindARThree instance
        const { renderer, scene, camera } = mindarThree;

        // Add a hemisphere light to illuminate the AR scene
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        // Load a 3D model (adidas) using the loadGLTF function and configure its scale and position
        const adidas = await loadGLTF('../assets/models/adidas/scene.gltf');
        adidas.scene.scale.set(3, 3, 3);
        adidas.scene.position.set(0, -0.4, 0);
        adidas.scene.userData.clickable = true; // Mark the model as clickable

        // Add an AR anchor for the adidas and attach the adidas model to it
        const adidasAnchor = mindarThree.addAnchor(0);
        adidasAnchor.group.add(adidas.scene);

        // Set up audio listener and attach it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // Create an audio object and load the sound
        const sound = new THREE.Audio(listener);
        const audio = await loadAudio('../assets/sounds/adidas/sambavoice.wav');
        sound.setBuffer(audio);

        // Event listener for click events
        document.body.addEventListener('click', (e) => {
            // Normalize mouse coordinates to -1 to 1 range
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            const mouse = new THREE.Vector2(mouseX, mouseY);

            // Set up a raycaster for detecting clicks on 3D objects
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            // Check if any clickable objects are clicked
            if (intersects.length > 0) {
                let o = intersects[0].object;
                while (o.parent && !o.userData.clickable) {
                    o = o.parent;
                }
                if (o.userData.clickable && o === adidas.scene) {
                    // Play sound if the model is clicked
                    sound.play();
                }
            }
        });

        // Start the MindARThree AR experience
        await mindarThree.start();

        // Set up a rendering loop using the Three.js renderer to continuously render the AR scene
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    }

    // Call the start function to begin the AR experience when the DOM content is loaded
    start();
});
