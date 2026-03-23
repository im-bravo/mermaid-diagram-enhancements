/**
 * Mermaid diagram enhancements: pan/zoom, popup modal, copy, zoom controls.
 * Uses svg-pan-zoom for GitHub-like interactive controls.
 * Framework-agnostic: accepts configurable containerSelector, sourceAttribute, etc.
 */

import { DEFAULT_OPTIONS } from './defaultOptions.js';

const ENHANCED_ATTR = 'data-mermaid-enhanced';
const ENHANCED_CLASS = 'mermaid-diagram-enhanced';

let svgPanZoomLib = null;
let intersectionObserver = null;
let mutationObserver = null;
let hashchangeHandler = null;
let currentOptions = null;

function getReactFiberNodeFromElement(element) {
  if (!element) return null;
  const keys = Object.keys(element);
  const fiberKey = keys.find((k) => k.startsWith('__reactFiber$') || k.startsWith('__reactContainer$'));
  return fiberKey ? element[fiberKey] : null;
}

function readStringPropFromFiber(fiber) {
  if (!fiber) return null;

  const propCandidates = [fiber.memoizedProps, fiber.pendingProps];
  for (const props of propCandidates) {
    if (!props || typeof props !== 'object') continue;

    // Docusaurus Mermaid renderer passes source as `value`.
    if (typeof props.value === 'string' && props.value.trim()) return props.value;
    if (typeof props.text === 'string' && props.text.trim()) return props.text;
  }

  return null;
}

function getSourceFromReactFiber(container) {
  const start = getReactFiberNodeFromElement(container);
  if (!start) return null;

  let current = start;
  let depth = 0;
  while (current && depth < 40) {
    const source = readStringPropFromFiber(current);
    if (source) return source;
    current = current.return;
    depth += 1;
  }

  return null;
}

function getMermaidSource(container, options) {
  const attributeSource = container.getAttribute(options.sourceAttribute);
  if (attributeSource) return attributeSource;

  const datasetSource = container.dataset?.mermaidSource || container.dataset?.mermaid;
  if (datasetSource) return datasetSource;

  // Fallback for Docusaurus theme-mermaid, which renders source in React props
  // but not as a DOM attribute.
  const reactSource = getSourceFromReactFiber(container);
  if (reactSource) {
    container.setAttribute(options.sourceAttribute, reactSource);
    return reactSource;
  }

  return null;
}

function getIntersectionObserver(options) {
  if (intersectionObserver) return intersectionObserver;
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          enhanceContainer(entry.target, options);
          intersectionObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '50px', threshold: 0.01 }
  );
  return intersectionObserver;
}

function addContainerToIntersectionObserver(container, options) {
  if (container.getAttribute(ENHANCED_ATTR) === 'true') return;
  getIntersectionObserver(options).observe(container);
}

async function getSvgPanZoom() {
  if (svgPanZoomLib) return svgPanZoomLib;
  const mod = await import('svg-pan-zoom');
  svgPanZoomLib = mod.default;
  return svgPanZoomLib;
}

function resetContainer(container) {
  container.removeAttribute(ENHANCED_ATTR);
  container.classList.remove(ENHANCED_CLASS);
  container.querySelectorAll(
    '.mermaid-copy-btn, .mermaid-expand-btn, .mermaid-zoom-controls'
  ).forEach((el) => el.remove());

  const svg = container.querySelector(':scope > svg');
  if (svg?._mermaidPanZoom) {
    try { svg._mermaidPanZoom.destroy(); } catch (_) {}
    svg._mermaidPanZoom = null;
  }
  if (container._mermaidResizeHandler) {
    window.removeEventListener('resize', container._mermaidResizeHandler);
    container._mermaidResizeHandler = null;
  }
  if (container._mermaidResizeRaf) {
    cancelAnimationFrame(container._mermaidResizeRaf);
    container._mermaidResizeRaf = null;
  }
  if (container._mermaidWheelZoom) {
    container.removeEventListener('wheel', container._mermaidWheelZoom, { capture: true });
    container._mermaidWheelZoom = null;
  }
  if (container._mermaidScrollHint) {
    clearTimeout(container._mermaidScrollHintTimer);
    container._mermaidScrollHint.remove();
    container._mermaidScrollHint = null;
  }
  container.style.removeProperty('height');
  container.style.removeProperty('overflow');
  container.style.removeProperty('width');
  container.style.removeProperty('max-width');
  container.style.removeProperty('margin-inline');
  container.style.removeProperty('aspect-ratio');
}

function applyEnhancements(container, svg, opts) {
  initPanZoom(container, svg, opts);
  if (opts.enableCopy) addCopyButton(container, opts);
  if (opts.enableExpand) addExpandButton(container, svg, opts);
  if (opts.enableZoomControls) addZoomControls(container, svg);
  if (opts.enableInlineWheelZoom) addWheelZoomHandler(container, svg, opts.wheelZoomRequiresCtrl);
  container.setAttribute(ENHANCED_ATTR, 'true');
  container.classList.add(ENHANCED_CLASS);

  // Watch for SVG replacement (e.g. Mermaid re-renders on theme change).
  // When the SVG child changes, reset and re-enhance.
  if (!container._mermaidSvgObserver) {
    const svgObserver = new MutationObserver(() => {
      const newSvg = container.querySelector(':scope > svg');
      if (newSvg && !newSvg._mermaidPanZoom) {
        resetContainer(container);
        applyEnhancements(container, newSvg, opts);
      }
    });
    svgObserver.observe(container, { childList: true });
    container._mermaidSvgObserver = svgObserver;
  }
}

function enhanceContainer(container, options) {
  if (container.getAttribute(ENHANCED_ATTR) === 'true') return;

  const svg = container.querySelector(':scope > svg');
  const opts = options || currentOptions;
  if (!opts) return;

  if (!svg) {
    const observer = new MutationObserver((mutations, obs) => {
      const s = container.querySelector(':scope > svg');
      if (s) {
        obs.disconnect();
        applyEnhancements(container, s, opts);
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    return;
  }

  applyEnhancements(container, svg, opts);
}

function initPanZoom(container, svg, options) {
  if (svg._mermaidPanZoom) return;

  svg.style.removeProperty('max-width');
  svg.style.removeProperty('width');
  svg.style.removeProperty('height');

  // Apply aspect-ratio to the container derived from the SVG's viewBox (or
  // width/height attributes as fallback). This lets CSS drive the container
  // height proportionally at width:100%, giving svg-pan-zoom a properly-sized
  // viewport. A min-height in CSS prevents very wide diagrams from collapsing.
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length >= 4) {
      const vbW = parseFloat(parts[2]);
      const vbH = parseFloat(parts[3]);
      if (vbW > 0 && vbH > 0) {
        container.style.setProperty('aspect-ratio', `${vbW} / ${vbH}`);
      }
    }
  } else {
    const attrW = parseFloat(svg.getAttribute('width'));
    const attrH = parseFloat(svg.getAttribute('height'));
    if (attrW > 0 && attrH > 0) {
      container.style.setProperty('aspect-ratio', `${attrW} / ${attrH}`);
    }
  }

  const panZoomOptions = { ...options.panZoomOptions };

  getSvgPanZoom()
    .then((svgPanZoom) => {
      try {
        const instance = svgPanZoom(svg, panZoomOptions);
        svg._mermaidPanZoom = instance;

        // Mirror svg-pan-zoom resize demo behavior.
        instance.resize();
        instance.fit();
        instance.center();

        const handler = () => {
          if (container._mermaidResizeRaf) cancelAnimationFrame(container._mermaidResizeRaf);
          container._mermaidResizeRaf = requestAnimationFrame(() => {
            container._mermaidResizeRaf = null;
            if (!svg._mermaidPanZoom) return;
            instance.resize();
            instance.fit();
            instance.center();
          });
        };
        window.addEventListener('resize', handler);
        container._mermaidResizeHandler = handler;
      } catch (e) {
        console.warn('[mermaid-diagram-pan-zoom] svg-pan-zoom init failed:', e);
      }
    })
    .catch((e) => console.warn('[mermaid-diagram-pan-zoom] svg-pan-zoom load failed:', e));
}

function addExpandButton(container, svg, options) {
  if (container.querySelector('.mermaid-expand-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'mermaid-expand-btn';
  btn.type = 'button';
  btn.title = 'Expand (fullscreen)';
  btn.setAttribute('aria-label', 'Expand diagram');
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

  btn.addEventListener('click', () => openModal(svg, options));

  container.style.position = 'relative';
  container.appendChild(btn);
}

function addCopyButton(container, options) {
  if (container.querySelector('.mermaid-copy-btn')) return;

  const source = getMermaidSource(container, options);
  if (!source) return;

  const copyIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const checkIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>';

  const btn = document.createElement('button');
  btn.className = 'mermaid-copy-btn';
  btn.type = 'button';
  btn.title = 'Copy source';
  btn.setAttribute('aria-label', 'Copy Mermaid source code');
  btn.innerHTML = copyIcon;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(source);
      btn.classList.add('mermaid-copy-btn--copied');
      btn.innerHTML = checkIcon;
      btn.title = 'Copied!';
      btn.setAttribute('aria-label', 'Copied');
      setTimeout(() => {
        btn.classList.remove('mermaid-copy-btn--copied');
        btn.innerHTML = copyIcon;
        btn.title = 'Copy source';
        btn.setAttribute('aria-label', 'Copy Mermaid source code');
      }, 1500);
    } catch (e) {
      console.warn('[mermaid-diagram-pan-zoom] copy failed:', e);
    }
  });

  container.insertBefore(btn, container.firstChild);
}

function getOrCreateScrollHint(container) {
  let hint = container._mermaidScrollHint;
  if (hint) return hint;

  const label = 'Ctrl + scroll to zoom (⌘ on Mac)';

  const overlay = document.createElement('div');
  overlay.className = 'mermaid-scroll-hint';
  const msg = document.createElement('div');
  msg.className = 'mermaid-scroll-hint__msg';
  msg.textContent = label;
  overlay.appendChild(msg);
  container.appendChild(overlay);

  container._mermaidScrollHint = overlay;
  return overlay;
}

function showScrollHint(container) {
  const overlay = getOrCreateScrollHint(container);
  overlay.classList.add('mermaid-scroll-hint--visible');

  clearTimeout(container._mermaidScrollHintTimer);
  container._mermaidScrollHintTimer = setTimeout(() => {
    overlay.classList.remove('mermaid-scroll-hint--visible');
  }, 700);
}

function addWheelZoomHandler(container, svg, requireCtrl = false) {
  if (container._mermaidWheelZoom) return;

  let lastWheelZoomTime = 0;

  const handler = (evt) => {
    const instance = svg._mermaidPanZoom;
    if (!instance) return;

    const dy = evt.deltaY ?? 0;
    if (dy === 0) return;

    // When requireCtrl is true, only zoom when a modifier key is held.
    // Mac: Cmd (metaKey) or trackpad pinch (sets ctrlKey=true by browser).
    // Win/Linux: Ctrl key (ctrlKey).
    if (requireCtrl && !evt.ctrlKey && !evt.metaKey) {
      showScrollHint(container);
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    const sensitivity = 0.12;
    const timeDelta = Date.now() - lastWheelZoomTime;
    lastWheelZoomTime = Date.now();
    const divider = 3 + Math.max(0, 30 - timeDelta);
    let delta = evt.deltaY ?? 0;
    if ('deltaMode' in evt && evt.deltaMode === 0 && evt.wheelDelta) {
      delta = evt.deltaY === 0 ? 0 : Math.abs(evt.wheelDelta) / evt.deltaY;
    }
    delta =
      delta > -0.3 && delta < 0.3
        ? delta
        : ((delta > 0 ? 1 : -1) * Math.log(Math.abs(delta) + 10)) / divider;

    const zoom = Math.pow(1 + sensitivity, -delta);
    instance.zoomBy(zoom);
  };

  container.addEventListener('wheel', handler, { passive: false, capture: true });
  container._mermaidWheelZoom = handler;
}

const PAN_STEP = 40;
const PAN_ANIMATION_STEPS = 10;
const PAN_ANIMATION_STEP_MS = 12;

function animatedPanBy(instance, amount) {
  const stepX = Math.round(amount.x / PAN_ANIMATION_STEPS);
  const stepY = Math.round(amount.y / PAN_ANIMATION_STEPS);
  if (stepX === 0 && stepY === 0) return;

  let step = 0;
  const id = setInterval(() => {
    if (step++ < PAN_ANIMATION_STEPS) {
      instance.panBy({ x: stepX, y: stepY });
    } else {
      clearInterval(id);
    }
  }, PAN_ANIMATION_STEP_MS);
}

function addZoomControls(container, svg, getInstance) {
  if (container.querySelector('.mermaid-zoom-controls')) return;

  const getPanZoom = getInstance ?? (() => svg?._mermaidPanZoom);

  const wrapper = document.createElement('div');
  wrapper.className = 'mermaid-zoom-controls';

  const arrowUp =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  const arrowDown =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
  const arrowLeft =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>';
  const arrowRight =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  const zoomInIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
  const zoomOutIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>';
  const resetIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';

  const btn = (className, title, ariaLabel, html) => {
    const b = document.createElement('button');
    b.className = `mermaid-zoom-btn ${className}`;
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', ariaLabel);
    b.innerHTML = html;
    return b;
  };

  const upBtn = btn('mermaid-pan-up', 'Pan up', 'Pan up', arrowUp);
  const downBtn = btn('mermaid-pan-down', 'Pan down', 'Pan down', arrowDown);
  const leftBtn = btn('mermaid-pan-left', 'Pan left', 'Pan left', arrowLeft);
  const rightBtn = btn('mermaid-pan-right', 'Pan right', 'Pan right', arrowRight);
  const zoomInBtn = btn('mermaid-zoom-in', 'Zoom in', 'Zoom in', zoomInIcon);
  const zoomOutBtn = btn('mermaid-zoom-out', 'Zoom out', 'Zoom out', zoomOutIcon);
  const resetBtn = btn('mermaid-zoom-reset', 'Reset', 'Reset zoom', resetIcon);

  const bind = (fn) => (e) => {
    e.preventDefault();
    const instance = getPanZoom();
    if (instance) fn(instance);
  };

  upBtn.addEventListener('click', bind((i) => animatedPanBy(i, { x: 0, y: PAN_STEP })));
  downBtn.addEventListener('click', bind((i) => animatedPanBy(i, { x: 0, y: -PAN_STEP })));
  leftBtn.addEventListener('click', bind((i) => animatedPanBy(i, { x: PAN_STEP, y: 0 })));
  rightBtn.addEventListener('click', bind((i) => animatedPanBy(i, { x: -PAN_STEP, y: 0 })));
  zoomInBtn.addEventListener('click', bind((i) => i.zoomIn()));
  zoomOutBtn.addEventListener('click', bind((i) => i.zoomOut()));
  resetBtn.addEventListener('click', bind((i) => i.reset()));

  wrapper.appendChild(document.createElement('span'));
  wrapper.appendChild(upBtn);
  wrapper.appendChild(zoomInBtn);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(resetBtn);
  wrapper.appendChild(rightBtn);
  wrapper.appendChild(document.createElement('span'));
  wrapper.appendChild(downBtn);
  wrapper.appendChild(zoomOutBtn);
  container.appendChild(wrapper);
}

function openModal(sourceSvg, options) {
  const opts = options || currentOptions;
  const panZoomOptions = opts ? { ...opts.panZoomOptions } : {};

  const overlay = document.createElement('div');
  overlay.className = 'mermaid-modal-overlay';

  const content = document.createElement('div');
  content.className = 'mermaid-modal-content';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'mermaid-modal-close';
  closeBtn.type = 'button';
  closeBtn.title = 'Close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '×';

  const svgClone = sourceSvg.cloneNode(true);
  const clonedControls = svgClone.querySelector('#svg-pan-zoom-controls');
  if (clonedControls) clonedControls.remove();
  const clonedControlStyles = svgClone.querySelector('style#svg-pan-zoom-controls-styles');
  if (clonedControlStyles) clonedControlStyles.remove();

  const svgWrapper = document.createElement('div');
  svgWrapper.className = 'mermaid-modal-svg-wrapper';
  svgWrapper.appendChild(svgClone);
  content.appendChild(svgWrapper);

  svgClone.removeAttribute('width');
  svgClone.removeAttribute('height');
  svgClone.style.removeProperty('max-width');
  svgClone.style.removeProperty('width');
  svgClone.style.removeProperty('height');

  overlay.appendChild(closeBtn);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  let panZoomInstance;

  const close = () => {
    if (panZoomInstance) {
      try {
        panZoomInstance.destroy();
      } catch (_) {}
    }
    overlay.remove();
    document.body.style.overflow = '';
  };

  const closeAndCleanup = () => {
    document.removeEventListener('keydown', handleEscape);
    close();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') closeAndCleanup();
  };

  closeBtn.addEventListener('click', closeAndCleanup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAndCleanup();
  });
  document.addEventListener('keydown', handleEscape);

  document.body.style.overflow = 'hidden';
  content.style.position = 'relative';

  getSvgPanZoom()
    .then((svgPanZoom) => {
      try {
        panZoomInstance = svgPanZoom(svgClone, panZoomOptions);
        svgClone._mermaidPanZoom = panZoomInstance;
        // Keep modal behavior stable regardless of inline sizing/zoom state.
        panZoomInstance.resize();
        panZoomInstance.fit();
        panZoomInstance.center();
        if (opts?.enableZoomControls) {
          addZoomControls(content, svgClone, () => panZoomInstance);
        }
        if (opts?.enableWheelZoom) {
          addWheelZoomHandler(content, svgClone);
        }
      } catch (e) {
        console.warn('[mermaid-diagram-pan-zoom] modal svg-pan-zoom init failed:', e);
      }
    })
    .catch((e) => console.warn('[mermaid-diagram-pan-zoom] modal svg-pan-zoom load failed:', e));
}

function enhanceMermaidDiagrams(options) {
  if (typeof window === 'undefined' || !document.querySelectorAll) return;
  const opts = options || currentOptions;
  if (!opts) return;

  const containers = document.querySelectorAll(opts.containerSelector);
  containers.forEach((c) => addContainerToIntersectionObserver(c, opts));
}

function observeNewMermaidContainers(options) {
  if (typeof window === 'undefined' || !document.body) return;
  const opts = options || currentOptions;
  if (!opts) return;

  let rafId = null;
  const observer = new MutationObserver(() => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      document.querySelectorAll(opts.containerSelector).forEach((c) =>
        addContainerToIntersectionObserver(c, opts)
      );
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

function setupHashchangeListener(options) {
  if (typeof window === 'undefined') return;
  const opts = options || currentOptions;
  if (!opts) return;

  const handler = () => {
    setTimeout(() => enhanceMermaidDiagrams(opts), 100);
  };
  window.addEventListener('hashchange', handler);
  return handler;
}

export function init(userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  options.panZoomOptions = { ...DEFAULT_OPTIONS.panZoomOptions, ...(userOptions.panZoomOptions || {}) };
  currentOptions = options;

  if (typeof window === 'undefined') return;

  mutationObserver = observeNewMermaidContainers(options);
  hashchangeHandler = setupHashchangeListener(options);

  const runEnhance = () => {
    enhanceMermaidDiagrams(options);
  };
  setTimeout(runEnhance, 100);
  setTimeout(runEnhance, 500);
  setTimeout(runEnhance, 1500);
  setTimeout(runEnhance, 3000);

  return options;
}

export function enhance() {
  if (!currentOptions) return;
  enhanceMermaidDiagrams(currentOptions);
}

export function destroy() {
  if (typeof window === 'undefined') return;

  if (mutationObserver && document.body) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  if (hashchangeHandler) {
    window.removeEventListener('hashchange', hashchangeHandler);
    hashchangeHandler = null;
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }

  // Clean up per-container SVG observers
  if (currentOptions) {
    document.querySelectorAll(`[${ENHANCED_ATTR}="true"]`).forEach((container) => {
      if (container._mermaidSvgObserver) {
        container._mermaidSvgObserver.disconnect();
        container._mermaidSvgObserver = null;
      }
      if (container._mermaidResizeHandler) {
        window.removeEventListener('resize', container._mermaidResizeHandler);
        container._mermaidResizeHandler = null;
      }
      if (container._mermaidResizeRaf) {
        cancelAnimationFrame(container._mermaidResizeRaf);
        container._mermaidResizeRaf = null;
      }
    });
  }

  currentOptions = null;
}
