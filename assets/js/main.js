document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-ready");

  const starCanvas = document.getElementById("starCanvas");
  const welcomeCanvas = document.getElementById("welcomeCanvas");

  function createRandom(seed) {
    let value = seed;

    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function drawStarfield() {
    if (!starCanvas) {
      return;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const context = starCanvas.getContext("2d");
    const random = createRandom(8082026);
    const starCount = Math.round(Math.min(460, Math.max(150, (width * height) / 3800)));

    starCanvas.width = Math.floor(width * ratio);
    starCanvas.height = Math.floor(height * ratio);
    starCanvas.style.width = `${width}px`;
    starCanvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    for (let index = 0; index < starCount; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const depth = random();
      const radius = depth > 0.92 ? 1.45 : depth > 0.72 ? 1.05 : 0.72;
      const alpha = depth > 0.92 ? 0.88 : depth > 0.72 ? 0.58 : 0.34;

      context.beginPath();
      context.fillStyle = `rgba(235, 244, 255, ${alpha})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    for (let index = 0; index < 18; index += 1) {
      const x = random() * width;
      const y = random() * height * 0.72;
      const radius = 1.4 + random() * 1.6;

      context.beginPath();
      context.fillStyle = "rgba(255, 255, 255, 0.9)";
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.strokeStyle = "rgba(255, 255, 255, 0.22)";
      context.moveTo(x - radius * 3.4, y);
      context.lineTo(x + radius * 3.4, y);
      context.moveTo(x, y - radius * 3.4);
      context.lineTo(x, y + radius * 3.4);
      context.stroke();
    }
  }

  function initButtonWobble() {
    const buttons = Array.from(document.querySelectorAll(".service-link"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    if (!buttons.length || reducedMotion.matches || !finePointer.matches) {
      return;
    }

    buttons.forEach((button) => {
      const state = {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        vx: 0,
        vy: 0,
        vRotate: 0,
        vScale: 0,
        targetX: 0,
        targetY: 0,
        targetRotate: 0,
        targetScale: 1,
        lastX: 0,
        lastY: 0,
        lastMove: 0,
        hovering: false,
        frame: 0,
      };

      function applyWobble() {
        button.style.setProperty("--wobble-x", `${state.x.toFixed(2)}px`);
        button.style.setProperty("--wobble-y", `${state.y.toFixed(2)}px`);
        button.style.setProperty("--wobble-rotate", `${state.rotate.toFixed(2)}deg`);
        button.style.setProperty("--wobble-scale", state.scale.toFixed(3));
      }

      function resetTargets() {
        state.targetX = 0;
        state.targetY = 0;
        state.targetRotate = 0;
        state.targetScale = state.hovering ? 1.012 : 1;
      }

      function animate(time) {
        if (state.hovering && time - state.lastMove > 90) {
          state.targetX *= 0.74;
          state.targetY *= 0.74;
          state.targetRotate *= 0.7;
          state.targetScale = 1.012;

          if (Math.abs(state.targetX) < 0.02) state.targetX = 0;
          if (Math.abs(state.targetY) < 0.02) state.targetY = 0;
          if (Math.abs(state.targetRotate) < 0.02) state.targetRotate = 0;
        }

        state.vx = (state.vx + (state.targetX - state.x) * 0.2) * 0.68;
        state.vy = (state.vy + (state.targetY - state.y) * 0.2) * 0.68;
        state.vRotate = (state.vRotate + (state.targetRotate - state.rotate) * 0.2) * 0.66;
        state.vScale = (state.vScale + (state.targetScale - state.scale) * 0.16) * 0.72;

        state.x += state.vx;
        state.y += state.vy;
        state.rotate += state.vRotate;
        state.scale += state.vScale;

        applyWobble();

        const energy =
          Math.abs(state.vx) +
          Math.abs(state.vy) +
          Math.abs(state.vRotate) +
          Math.abs(state.vScale * 20) +
          Math.abs(state.targetX - state.x) * 0.35 +
          Math.abs(state.targetY - state.y) * 0.35 +
          Math.abs(state.targetRotate - state.rotate) * 0.35 +
          Math.abs(state.targetScale - state.scale) * 20;

        if (energy > 0.015) {
          state.frame = window.requestAnimationFrame(animate);
          return;
        }

        state.frame = 0;

        if (!state.hovering) {
          state.x = 0;
          state.y = 0;
          state.rotate = 0;
          state.scale = 1;
          state.vx = 0;
          state.vy = 0;
          state.vRotate = 0;
          state.vScale = 0;
          applyWobble();
          button.classList.remove("is-wobbling");
        }
      }

      function start() {
        button.classList.add("is-wobbling");

        if (!state.frame) {
          state.frame = window.requestAnimationFrame(animate);
        }
      }

      button.addEventListener("pointerenter", (event) => {
        state.hovering = true;
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.lastMove = performance.now();
        state.targetScale = 1.018;
        start();
      });

      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const dx = event.clientX - state.lastX;
        const dy = event.clientY - state.lastY;
        const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
        const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
        const speed = Math.min(Math.hypot(dx, dy), 34);

        state.targetX = clamp(relativeX * 7 + dx * 0.15, -8, 8);
        state.targetY = clamp(relativeY * 5 + dy * 0.12, -6, 6);
        state.targetRotate = clamp(relativeX * 7 + dx * 0.26, -9, 9);
        state.targetScale = 1 + Math.min(speed * 0.0014, 0.03);
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.lastMove = performance.now();

        start();
      });

      button.addEventListener("pointerleave", () => {
        state.hovering = false;
        resetTargets();
        start();
      });

      button.addEventListener("pointercancel", () => {
        state.hovering = false;
        resetTargets();
        start();
      });

      button.addEventListener("blur", () => {
        state.hovering = false;
        resetTargets();
        start();
      });
    });
  }

  initButtonWobble();

  if (!welcomeCanvas) {
    return;
  }

  const scenes = [
    {
      label: "欢迎来到808实验室",
      lineGap: 8,
      lines: [
        { text: "欢迎来到", maxSize: 86, minSize: 30, fontStack: 'DengXian, "Microsoft YaHei UI", "Noto Sans SC", sans-serif', letterSpacing: 14, threshold: 112, weight: 400 },
        { text: "808", maxSize: 92, minSize: 34, fontStack: 'DengXian, "Microsoft YaHei UI", "Noto Sans SC", sans-serif', letterSpacing: 14, threshold: 112, weight: 400 },
        { text: "实验室", maxSize: 96, minSize: 34, fontStack: 'DengXian, "Microsoft YaHei UI", "Noto Sans SC", sans-serif', letterSpacing: 14, threshold: 112, weight: 400 },
      ],
    },
    {
      label: "Welcome to 808 LAB!",
      lineGap: 24,
      lines: [
        { text: "WELCOME TO", maxSize: 86, minSize: 26, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 5, threshold: 86, weight: 700 },
        { text: "808 LAB", maxSize: 104, minSize: 34, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 5, threshold: 86, weight: 700, manualBang: true },
      ],
    },
    {
      label: "CUDA 永不 out of memory。",
      lineGap: 12,
      lines: [
        { text: "CUDA", maxSize: 88, minSize: 32, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 5, threshold: 86, weight: 700 },
        { text: "永不", maxSize: 76, minSize: 28, fontStack: 'DengXian, "Microsoft YaHei UI", "Noto Sans SC", sans-serif', letterSpacing: 14, threshold: 112, weight: 400 },
        { text: "out of", maxSize: 56, minSize: 22, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 4, threshold: 86, weight: 700 },
        { text: "MEMORY.", maxSize: 72, minSize: 26, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 8, threshold: 74, weight: 700 },
      ],
    },
    {
      label: "天天开心，all all accept！",
      lineGap: 12,
      lines: [
        { text: "天天开心", maxSize: 78, minSize: 28, fontStack: 'DengXian, "Microsoft YaHei UI", "Noto Sans SC", sans-serif', letterSpacing: 14, threshold: 112, weight: 400 },
        { text: "all all", maxSize: 78, minSize: 26, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 5, threshold: 86, weight: 700 },
        { text: "accept", maxSize: 92, minSize: 30, fontStack: 'Consolas, "Lucida Console", "Courier New", monospace', letterSpacing: 5, threshold: 86, weight: 700, color: "#ff4040", manualBang: true },
      ],
    },
  ];

  const canvasContext = welcomeCanvas.getContext("2d");
  const displayDuration = 3200;
  const transitionSteps = 28;
  const transitionStepMs = 42;
  const baseCanvasWidth = 723;
  const baseCanvasHeight = 392;
  let resizeFrame = 0;
  let timer = 0;
  let layout = null;
  let currentScene = 0;
  let isTransitioning = false;

  function measureSpacedText(context, text, letterSpacing) {
    const characters = Array.from(text);

    return characters.reduce((width, character, index) => {
      const spacing = index === 0 ? 0 : letterSpacing;
      return width + spacing + context.measureText(character).width;
    }, 0);
  }

  function drawSpacedText(context, text, x, y, letterSpacing) {
    const characters = Array.from(text);
    const textWidth = measureSpacedText(context, text, letterSpacing);
    let currentX = x - textWidth / 2;

    characters.forEach((character) => {
      context.fillText(character, currentX, y);
      currentX += context.measureText(character).width + letterSpacing;
    });
  }

  function drawManualBang(context, text, x, y, fontSize, letterSpacing) {
    const textWidth = measureSpacedText(context, text, letterSpacing);
    const bangWidth = Math.max(7, Math.round(fontSize * 0.08));
    const bangX = x + textWidth / 2 + Math.max(16, Math.round(fontSize * 0.16));
    const barTop = y - fontSize * 0.36;
    const barBottom = y + fontSize * 0.13;
    const dotTop = y + fontSize * 0.29;
    const dotBottom = dotTop + bangWidth * 1.2;

    context.fillRect(bangX, barTop, bangWidth, barBottom - barTop);
    context.fillRect(bangX, dotTop, bangWidth, dotBottom - dotTop);
  }

  function fitFontSize(context, text, maxSize, minSize, maxWidth, weight, letterSpacing) {
    let fontSize = maxSize;
    context.font = `${weight} ${fontSize}px ${context.fontStack}`;

    while (fontSize > minSize && measureSpacedText(context, text, letterSpacing) > maxWidth) {
      fontSize -= 2;
      context.font = `${weight} ${fontSize}px ${context.fontStack}`;
    }

    return fontSize;
  }

  function alphaAt(data, canvasWidth, canvasHeight, x, y) {
    const px = Math.max(0, Math.min(canvasWidth - 1, Math.floor(x)));
    const py = Math.max(0, Math.min(canvasHeight - 1, Math.floor(y)));
    return data[(py * canvasWidth + px) * 4 + 3];
  }

  function hashBlock(x, y, index) {
    const value = Math.sin(x * 12.9898 + y * 78.233 + index * 37.719) * 43758.5453;
    return value - Math.floor(value);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getSceneScale(metrics) {
    const widthScale = metrics.cssWidth / baseCanvasWidth;
    const heightScale = metrics.cssHeight / baseCanvasHeight;

    return clamp(Math.min(widthScale, heightScale), 0.62, 1.55);
  }

  function buildLineBlocks(line, metrics, y, fontSize, letterSpacing, blockOffset) {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = Math.floor(metrics.cssWidth);
    sampleCanvas.height = Math.floor(metrics.cssHeight);

    const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
    sampleContext.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
    sampleContext.textAlign = "center";
    sampleContext.textBaseline = "middle";
    sampleContext.fillStyle = "#ffffff";
    sampleContext.font = `${line.weight} ${fontSize}px ${line.fontStack}`;

    drawSpacedText(sampleContext, line.text, metrics.cssWidth / 2, y, letterSpacing);

    if (line.manualBang) {
      drawManualBang(sampleContext, line.text, metrics.cssWidth / 2, y, fontSize, letterSpacing);
    }

    const sampleData = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    const blocks = [];
    let index = blockOffset;

    for (let y = metrics.offsetY; y < metrics.cssHeight; y += metrics.step) {
      for (let x = metrics.offsetX; x < metrics.cssWidth; x += metrics.step) {
        const alpha = Math.max(
          alphaAt(sampleData, sampleCanvas.width, sampleCanvas.height, x + metrics.blockSize / 2, y + metrics.blockSize / 2),
          alphaAt(sampleData, sampleCanvas.width, sampleCanvas.height, x + 1, y + 1),
          alphaAt(sampleData, sampleCanvas.width, sampleCanvas.height, x + metrics.blockSize - 1, y + 1),
          alphaAt(sampleData, sampleCanvas.width, sampleCanvas.height, x + 1, y + metrics.blockSize - 1),
          alphaAt(sampleData, sampleCanvas.width, sampleCanvas.height, x + metrics.blockSize - 1, y + metrics.blockSize - 1)
        );

        if (alpha > line.threshold) {
          const diagonal = (x / metrics.cssWidth + y / metrics.cssHeight) / 2;
          const noise = hashBlock(x, y, index);
          const switchPoint = Math.min(
            transitionSteps,
            Math.max(1, Math.floor((diagonal * 0.55 + noise * 0.45) * transitionSteps))
          );

          blocks.push({ x, y, switchPoint, color: line.color || "#ffffff" });
          index += 1;
        }
      }
    }

    return blocks;
  }

  function centerLineBlocks(blocks, metrics) {
    if (blocks.length === 0) {
      return blocks;
    }

    const minX = blocks.reduce((value, block) => Math.min(value, block.x), Infinity);
    const maxX = blocks.reduce((value, block) => Math.max(value, block.x + metrics.blockSize), -Infinity);
    const visualCenter = (minX + maxX) / 2;
    const shift = Math.round((metrics.cssWidth / 2 - visualCenter) / metrics.step) * metrics.step;

    if (shift === 0) {
      return blocks;
    }

    return blocks.map((block) => ({
      ...block,
      x: block.x + shift,
    }));
  }

  function buildSceneBlocks(scene, metrics) {
    const measureCanvas = document.createElement("canvas");
    const measureContext = measureCanvas.getContext("2d");
    const sceneScale = getSceneScale(metrics);
    const lineGap = scene.lineGap
      ? Math.round(scene.lineGap * sceneScale * (metrics.isCompact ? 0.86 : 1))
      : metrics.isCompact ? 18 : 24;
    const preparedLines = scene.lines.map((line) => {
      const maxSize = Math.max(16, Math.round(line.maxSize * sceneScale));
      const minSize = Math.max(14, Math.round(line.minSize * Math.min(sceneScale, 1)));
      const letterSpacing = line.letterSpacing
        ? Math.max(2, Math.round(line.letterSpacing * sceneScale * (metrics.isCompact ? 0.72 : 1)))
        : 0;

      measureContext.fontStack = line.fontStack;

      return {
        ...line,
        letterSpacing,
        minSize,
        fontSize: fitFontSize(measureContext, line.text, maxSize, minSize, metrics.cssWidth - 34, line.weight, letterSpacing),
      };
    });
    let finalLineGap = lineGap;
    let totalTextHeight = preparedLines.reduce((sum, line) => sum + line.fontSize, 0) + finalLineGap * (preparedLines.length - 1);
    const maxTextHeight = metrics.cssHeight * 0.86;

    if (totalTextHeight > maxTextHeight) {
      const verticalScale = maxTextHeight / totalTextHeight;
      finalLineGap = Math.max(3, Math.round(finalLineGap * verticalScale));
      preparedLines.forEach((line) => {
        line.fontSize = Math.max(line.minSize, Math.floor(line.fontSize * verticalScale));
      });
      totalTextHeight = preparedLines.reduce((sum, line) => sum + line.fontSize, 0) + finalLineGap * (preparedLines.length - 1);
    }

    let lineY = metrics.cssHeight / 2 - totalTextHeight / 2;
    let blocks = [];

    preparedLines.forEach((line) => {
      lineY += line.fontSize / 2;
      blocks = blocks.concat(centerLineBlocks(
        buildLineBlocks(line, metrics, lineY, line.fontSize, line.letterSpacing, blocks.length),
        metrics
      ));
      lineY += line.fontSize / 2 + finalLineGap;
    });

    return blocks;
  }

  function rebuildLayout() {
    const parent = welcomeCanvas.parentElement;
    const parentWidth = parent ? parent.clientWidth : 1100;
    const parentHeight = parent ? parent.clientHeight : 520;
    const cssWidth = Math.max(280, Math.min(parentWidth - 32, 1180));
    const isCompact = cssWidth < 560;
    const cssHeight = Math.max(isCompact ? 300 : 360, Math.min(parentHeight - 48, 620));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const blockSize = 4;
    const gap = 1;
    const step = blockSize + gap;

    welcomeCanvas.style.width = `${cssWidth}px`;
    welcomeCanvas.style.height = `${cssHeight}px`;
    welcomeCanvas.width = Math.floor(cssWidth * ratio);
    welcomeCanvas.height = Math.floor(cssHeight * ratio);

    canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    const metrics = {
      cssWidth,
      cssHeight,
      isCompact,
      blockSize,
      step,
      offsetX: Math.floor((cssWidth % step) / 2),
      offsetY: Math.floor((cssHeight % step) / 2),
    };

    layout = {
      ...metrics,
      scenes: scenes.map((scene) => buildSceneBlocks(scene, metrics)),
    };
  }

  function drawBlocks(blocks, predicate) {
    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];

      if (predicate(block)) {
        canvasContext.fillStyle = block.color;
        canvasContext.fillRect(block.x, block.y, layout.blockSize, layout.blockSize);
      }
    }
  }

  function clearCanvas() {
    canvasContext.clearRect(0, 0, layout.cssWidth, layout.cssHeight);
  }

  function drawScene(sceneIndex) {
    currentScene = sceneIndex;
    clearCanvas();
    drawBlocks(layout.scenes[sceneIndex], () => true);
    welcomeCanvas.parentElement?.setAttribute("aria-label", scenes[sceneIndex].label);
  }

  function drawTransition(fromScene, toScene, step) {
    clearCanvas();
    drawBlocks(layout.scenes[fromScene], (block) => block.switchPoint > step);
    drawBlocks(layout.scenes[toScene], (block) => block.switchPoint <= step);
  }

  function scheduleNextSwitch() {
    window.clearTimeout(timer);

    if (!document.hidden) {
      timer = window.setTimeout(startSwitch, displayDuration);
    }
  }

  function startSwitch() {
    if (!layout || isTransitioning) {
      return;
    }

    isTransitioning = true;

    const fromScene = currentScene;
    const toScene = (currentScene + 1) % scenes.length;
    let step = 0;

    function tick() {
      if (document.hidden) {
        isTransitioning = false;
        return;
      }

      step += 1;
      drawTransition(fromScene, toScene, step);

      if (step < transitionSteps) {
        timer = window.setTimeout(tick, transitionStepMs);
        return;
      }

      isTransitioning = false;
      drawScene(toScene);
      scheduleNextSwitch();
    }

    tick();
  }

  function resetAndDraw() {
    window.clearTimeout(timer);
    isTransitioning = false;
    rebuildLayout();
    drawScene(currentScene);
    scheduleNextSwitch();
  }

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      drawStarfield();
      resetAndDraw();
    });
  });

  document.addEventListener("visibilitychange", () => {
    window.clearTimeout(timer);

    if (!document.hidden) {
      drawScene(currentScene);
      scheduleNextSwitch();
    }
  });

  drawStarfield();
  resetAndDraw();

  window.addEventListener("beforeunload", () => {
    window.clearTimeout(timer);
  });
});
