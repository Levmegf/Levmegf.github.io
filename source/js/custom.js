/* ==========================================================
   自定义脚本
   在 _config.butterfly.yml 的 inject.bottom 中引入。
   ========================================================== */
(function () {
  'use strict';

  // 顶部阅读进度条：只在文章页出现，随正文滚动进度增长
  var article = document.getElementById('article-container');
  if (!article || !document.getElementById('post')) return;

  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  var ticking = false;

  function update() {
    ticking = false;
    var rect = article.getBoundingClientRect();
    var scrollable = rect.height - window.innerHeight;
    // 正文短于一屏时没有进度可言，直接满格
    var ratio = scrollable > 0 ? -rect.top / scrollable : 1;
    ratio = Math.max(0, Math.min(1, ratio));
    bar.style.width = (ratio * 100).toFixed(2) + '%';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();