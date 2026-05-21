# 共通タブバーとアクティブJS
TABBAR = '''<nav class="p-tabbar">
  <a class="p-tab" href="/"><span class="p-tab-icon">🏠</span>ホーム</a>
  <a class="p-tab" href="/cards"><span class="p-tab-icon">📖</span>カード</a>
  <a class="p-tab" href="/reika"><span class="p-tab-icon">⚔️</span>野望</a>
  <a class="p-tab" href="/formation"><span class="p-tab-icon">🧩</span>編成</a>
  <a class="p-tab" href="/tasks"><span class="p-tab-icon">📅</span>タスク</a>
  <a class="p-tab" href="/memo"><span class="p-tab-icon">📝</span>メモ</a>
</nav>
<script>
(function(){
  var path = location.pathname;
  document.querySelectorAll(".p-tab").forEach(function(tab){
    var href = tab.getAttribute("href");
    if(href && (path === href || (href !== "/" && path.startsWith(href)))){
      tab.classList.add("active");
    }
  });
})();
</script>'''

HEAD = '''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="/assets/common.css">
<link rel="stylesheet" href="/pages/wiki/wiki.css">'''

BREADCRUMB_BASE = '''  <div class="wiki-breadcrumb">
    <a href="/">ホーム</a>
    <span class="wiki-breadcrumb-sep">›</span>
    <a href="/wiki">攻略Wiki</a>
    <span class="wiki-breadcrumb-sep">›</span>'''

print("base module OK")
