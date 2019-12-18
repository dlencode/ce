var scene, camera, renderer;
var controls;

var TABLET_WIDTH = 768;

// var WIDTH = window.innerWidth;
// var HEIGHT = window.innerHeight;
var WIDTH = 1200;
var HEIGHT = 680;

var SPEED = 0.01;

var time = 0;
var timeBase = 0;

var cameraBase = new THREE.Vector3(0, .5, 15);

var LEEWAY_X = 3 * .1;
var LEEWAY_Y = 1 * .1;
var offX = 0;
var offY = 0;

var container;

var earth;
var layer1, layer2, layer3;
var layer1w, layer2w, layer3w;
var all;

var textures;

var camPerlin = new Perlin(Math.random() * 9999);
var WIGGLE_X = 1.5;
var WIGGLE_Y = 3;

var coords = [];

var raycaster;
var mouse;
var lastMouseHit = null;
var hotSpots = [];

var TIME_INC = .002;
var SHIFT_INC = 1;

var speedControls = {
    time: TIME_INC,
    shift: SHIFT_INC
};

function init() {
    scene = new THREE.Scene();

    initCamera();
    initLights();
    initRenderer();
    initMeshes();

    // initControls();

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    initEvents();

    onWindowResize();
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 2000);
    camera.position.set(cameraBase.x, cameraBase.y, cameraBase.z);
    camera.lookAt(scene.position);

    cameraPos = new THREE.Vector2(0, 0);
}


function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(WIDTH, HEIGHT);

    // renderer.shadowMapEnabled = true;
    // renderer.shadowMapType = THREE.PCFSoftShadowMap;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMapType = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
}

function onWindowResize() {
    // fit width
    // var w = container.offsetWidth;
    // var h = w / (WIDTH / HEIGHT);

    // fit height
    var h = container.offsetHeight;
    var w = h * (WIDTH / HEIGHT);

    // console.log(w, 'x', h);

    var diff = (container.offsetWidth - w) / 2;
    var diffTop = 0;

    // var vpWidth = window.visualViewport.width;
    var vpWidth = window.innerWidth;

    var k = vpWidth / TABLET_WIDTH;
    if (k >= 1) {
        diff += k * 100;// move right
    } else {
        diff -= k * 150;// move left
        diffTop = window.innerHeight * .2;
    }
    // console.log('diff:', diff);

    renderer.domElement.style.marginLeft = diff + 'px';
    renderer.domElement.style.marginTop = diffTop + 'px';

    if (w >= WIDTH) {
        // if (w >= 600) {
        toggleTexFilter(true);
    } else {
        toggleTexFilter(false);
    }

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
}

function initEvents() {
    raycaster = new THREE.Raycaster(), lastMouseHit;
    mouse = new THREE.Vector2(-1, -1);
}

function onMouseMove(e) {
    var c = container;
    var x = e.pageX - c.offsetLeft;
    var y = e.pageY - c.offsetTop;

    // calc mouse for camera
    offX = (x / c.offsetWidth - .5);
    offY = (y / c.offsetHeight - .5);

    // calc mouse for raycaster
    mouse = {
        x: (x / c.offsetWidth) * 2 - 1,
        y: -(y / c.offsetHeight) * 2 + 1
    };

    // console.log(mouse.x.toFixed(1), ' x ', mouse.y.toFixed(1));

    // console.log(w, 'x', h);

    // camera.updateProjectionMatrix();
}

function initLights() {
    var lightA = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(lightA);

    // lightP = new THREE.PointLight(0xffffff, 1.5, .001);
    // lightP.position.set(.1, 6, 3);
    // scene.add(lightP);

    // lightP.castShadow = true;

    // var cameraHelper = new THREE.CameraHelper(lightP.shadow.camera);
    // scene.add(cameraHelper);    
}

function initMeshes() {
    initEarth();
    initLayers();
    initHotspots();
}

function initEarth() {
    var texture = new THREE.TextureLoader().load('https://uploads-ssl.webflow.com/5d26d80e8836af7216ed124d/5dfa3cc01ebd087fbfb60b05_earth.png');
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // texture.minFilter = THREE.LinearFilter;
    // texture.magFilter = THREE.NearestFilter;
    // texture.minFilter = THREE.LinearMipMapLinearFilter;

    var geometry = new THREE.SphereGeometry(1 * .38, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });
    earth = new THREE.Mesh(geometry, material);
    earth.position.x = -.5;

    scene.add(earth);
}

function initLayers() {
    var LAYER_Z_PAD = 2.5;

    textures = [];
    var texture;

    var txScale = .025;
    var zd1 = 1;
    var zd2 = 3;
    var zd3 = 5;

    texture = new THREE.TextureLoader().load('https://uploads-ssl.webflow.com/5d26d80e8836af7216ed124d/5dfa3cbe41a0f0f0d26ebf37_layer1.png');
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(texture);

    var zFix;

    zFix = 1.2;
    var geometry = new THREE.PlaneGeometry(539 * txScale * zFix, 678 * txScale * zFix, 1, 1);
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    layer1 = new THREE.Mesh(geometry, material);


    texture = new THREE.TextureLoader().load('https://uploads-ssl.webflow.com/5d26d80e8836af7216ed124d/5dfa3cbf8f664e0feee42528_layer2.png');
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(texture);

    zFix = 1.4;
    var geometry = new THREE.PlaneGeometry(745 * txScale * zFix, 856 * txScale * zFix, 1, 1);
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    layer2 = new THREE.Mesh(geometry, material);


    texture = new THREE.TextureLoader().load('https://uploads-ssl.webflow.com/5d26d80e8836af7216ed124d/5dfa3cbf02e0d903e417ac41_layer3.png');
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(texture);

    zFix = 1.7;
    var geometry = new THREE.PlaneGeometry(872 * txScale * zFix, 807 * txScale * zFix, 1, 1);
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    layer3 = new THREE.Mesh(geometry, material);

    var box = new THREE.Box3().setFromObject(earth);
    var size = box.getSize(new THREE.Vector3()).length();

    console.log('SIZE', size);

    layer1w = new THREE.Group();
    layer2w = new THREE.Group();
    layer3w = new THREE.Group();

    layer1w.add(layer1);
    layer2w.add(layer2);
    layer3w.add(layer3);

    layer1w.position.x = .2;
    layer1w.position.y = -1.5;

    layer2w.position.x = 4.0;
    layer2w.position.y = -6.0;

    layer3w.position.x = 7.0;
    layer3w.position.y = -8;

    coords[0] = { x: 0, y: 0 };
    coords[1] = { x: 0, y: 0 };
    coords[2] = { x: 0, y: 0 };
    coords[0].x = layer1w.position.x;
    coords[0].y = layer1w.position.y;
    coords[1].x = layer2w.position.x;
    coords[1].y = layer2w.position.y;
    coords[2].x = layer3w.position.x;
    coords[2].y = layer3w.position.y;

    layer1w.position.z = earth.position.z - 2 - LAYER_Z_PAD;
    layer2w.position.z = layer1w.position.z - LAYER_Z_PAD;
    layer3w.position.z = layer2w.position.z - LAYER_Z_PAD;

    // move everything up a notch
    all = new THREE.Group();
    all.add(earth);
    all.add(layer1w);
    all.add(layer2w);
    all.add(layer3w);
    all.position.y = 2;

    // scene.add(layer1);
    // scene.add(layer2);
    // scene.add(layer3);

    scene.add(all);
}

function toggleTexFilter(st) {
    console.log('TX is ' + (st ? 'ON' : 'off'));
    textures.forEach(function (texture) {
        // texture.magFilter = st ? THREE.LinearFilter : THREE.LinearFilter;
        texture.minFilter = st ? THREE.NearestFilter : THREE.LinearMipMapLinearFilter;
    });
}

function initHotspots() {

    var box = new THREE.Box3().setFromObject(layer1);
    var size = box.getSize(new THREE.Vector3()).length();
    var center = box.getCenter(new THREE.Vector3());

    var k;

    k = .01 * 2.5;
    var geometry = new THREE.PlaneGeometry(140 * k, 280 * k, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: .0 });
    spot1 = new THREE.Mesh(geometry, material);
    spot1.position.z = layer1.position.z + 1;

    k = .01 * 3.5;
    var geometry = new THREE.PlaneGeometry(240 * k, 390 * k, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: .0 });
    spot2 = new THREE.Mesh(geometry, material);
    spot2.position.z = layer2.position.z + 1;

    k = .01 * 4.0;
    var geometry = new THREE.PlaneGeometry(430 * k, 410 * k, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: .0 });
    spot3 = new THREE.Mesh(geometry, material);
    spot3.position.z = layer3.position.z + 1;

    all.add(spot1);
    all.add(spot2);
    all.add(spot3);

    hotSpots.push(spot1);
    hotSpots.push(spot2);
    hotSpots.push(spot3);
}

function render() {
    requestAnimationFrame(render);

    timeBase += TIME_INC;
    time += speedControls.time;

    earth.rotation.y += Math.PI * 2 / 360 * speedControls.time * 350;


    if (true) {
        var off = 2;
        // var wobbleK = speedControls.shift;
        var wobbleK = 1;
        // var t = time;
        var t = timeBase;

        layer1w.position.x = coords[0].x + camPerlin.noise(t, 0, 0) * WIGGLE_X * wobbleK;
        layer1w.position.y = coords[0].y + camPerlin.noise(0, t, 0) * WIGGLE_Y * wobbleK;

        layer2w.position.x = coords[1].x + camPerlin.noise(t + off * 1, 0, 0) * WIGGLE_X * wobbleK;
        layer2w.position.y = coords[1].y + camPerlin.noise(0, t + off * 1, 0) * WIGGLE_Y * wobbleK;

        layer3w.position.x = coords[2].x + camPerlin.noise(t + off * 2, 0, 0) * WIGGLE_X * wobbleK;
        layer3w.position.y = coords[2].y + camPerlin.noise(0, t + off * 2, 0) * WIGGLE_Y * wobbleK;

        spot1.position.x = layer1w.position.x - .8;
        spot1.position.y = layer1w.position.y + .8;
        spot2.position.x = layer2w.position.x - 1.9;
        spot2.position.y = layer2w.position.y + 2.2;
        spot3.position.x = layer3w.position.x - 1.1;
        spot3.position.y = layer3w.position.y + .5;
    }

    var newX = cameraBase.x + offX * LEEWAY_X;
    var newY = cameraBase.y - offY * LEEWAY_Y;
    var diffX = camera.position.x - newX;
    var diffY = camera.position.y - newY;

    // console.log(newX, ' // ', newY);
    // console.log(offX, ' // ', offY);

    // camera.position.x = cameraBase.x + newX * .9;
    // camera.position.y = cameraBase.y + newY * .9;
    // camera.position.x = cameraBase.x + diffX * .95;
    // camera.position.y = cameraBase.y + diffY * .95;

    renderer.render(scene, camera);

    detectMouse();
}

function detectMouse() {
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(hotSpots);

    if (mouse && intersects.length > 0) {
        if (!lastMouseHit) {
            lastMouseHit = intersects[0].object;
            onMouseOver();
        }
    } else {
        if (lastMouseHit) {
            onMouseOut();
        }
        lastMouseHit = null;
    }
}

function onMouseOver() {
    if (TweenMax.isTweening(layer1.rotation)) return;

    var tl = new TimelineMax();
    var e1 = Power3.easeOut;
    // var e2 = Linear.easeNone;
    var e2 = Sine.easeInOut;

    var p1 = .0;
    var t1 = .5;
    var t2 = 1.;
    var off = .1;

    var shiftX = .15;
    var shiftY = .8;
    var shiftR = .05;

    tl
        .add('start', 0)
        .staggerTo([layer1.position, layer2.position, layer3.position], t1, { x: '+=' + shiftX, y: '-=' + shiftY, ease: e1 }, off, p1)
        .staggerTo([layer1.position, layer2.position, layer3.position], t2, { x: '-=' + shiftX, y: '+=' + shiftY, ease: e2 }, off, p1 + t1)
        .staggerTo([layer1.rotation, layer2.rotation, layer3.rotation], t1, { z: '-=' + shiftR, ease: e1 }, off, p1)
        .staggerTo([layer1.rotation, layer2.rotation, layer3.rotation], t2, { z: '+=' + shiftR, ease: e2 }, off, p1 + t1)

        .to(speedControls, .5, { time: TIME_INC * 5, shift: SHIFT_INC * 1.2, ease: Power3.easeOut }, 'start')
        .to(speedControls, 1.5, { time: TIME_INC * 1, shift: SHIFT_INC * 1, ease: Power3.easeOut })
}

function onMouseOut() {
    var tl = new TimelineMax();
    tl
        .add('start', 0)
    // .staggerTo([layer1.scale, layer2.scale, layer3.scale], 1.0, { x: 1.0, y: 1.0, ease: Power3.easeOut }, .05)
    // .to(earth.scale, 1, { x: 1, y: 1, z: 1, ease: Power2.easeInOut }, 'start')

    // .to(speedControls, 1.5, { time: TIME_INC * 1, shift: SHIFT_INC * 1, ease: Power3.easeOut }, 'start')
}

init();
render();
