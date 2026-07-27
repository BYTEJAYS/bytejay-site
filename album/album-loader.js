(() => {
  const loader = document.querySelector("[data-album-loader]");
  if (!loader) return;

  const images = [...document.querySelectorAll('img[draggable="false"][src^="/album/jay-"]')];
  const count = loader.querySelector("[data-loader-count]");
  const total = images.length || 11;
  const startedAt = performance.now();
  let loaded = 0;
  let finished = false;

  const render = () => {
    count.textContent = `${String(loaded).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimum = reducedMotion ? 0 : 3000;
    const delay = Math.max(0, minimum - (performance.now() - startedAt));
    window.setTimeout(() => {
      loaded = total;
      render();
      loader.classList.add("is-leaving");
      document.documentElement.classList.remove("album-is-loading");
      window.setTimeout(() => { loader.hidden = true; }, reducedMotion ? 0 : 920);
    }, delay);
  };

  const markLoaded = () => {
    loaded += 1;
    render();
    if (loaded >= total) finish();
  };

  render();
  window.setTimeout(() => loader.classList.add("is-shooting"), 850);
  window.setTimeout(() => loader.classList.add("is-developing"), 1420);
  images.forEach((image) => {
    if (image.complete) markLoaded();
    else {
      image.addEventListener("load", markLoaded, { once: true });
      image.addEventListener("error", markLoaded, { once: true });
    }
  });

  window.setTimeout(finish, 4000);
})();
