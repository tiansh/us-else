// ==UserScript==
// @name              Weibo Music Download Tool
// @name:zh-CN        微博音乐下载
// @namespace         https://github.com/tiansh/
// @description       下载微博 weibo.com 上的音乐
// @description:zh-CN 下载微博 weibo.com 上的音乐
// @include           http://www.weibo.com/*
// @include           http://weibo.com/*
// @include           http://d.weibo.com/*
// @include           http://s.weibo.com/*
// @exclude           http://weibo.com/a/bind/*
// @exclude           http://weibo.com/nguide/*
// @exclude           http://weibo.com/
// @version           1.0
// @grant             GM_xmlhttpRequest
// @grant             GM_addStyle
// @run-at            document-end
// ==/UserScript==

var url = {
  'songinfo': 'http://ting.weibo.com/page/playlist/getSongInfo?object_id=1022:{{id}}&callback={{callback}}'
};

var util = {};

util.func = {};
util.func.call = function (f) {
  setTimeout.bind(window, f, 0).apply(null, Array.from(arguments).slice(1));
};

util.str = {};
util.str.fcb = (function () {
  var last = 0;
  return function () {
    return 'STK_' + (last = Math.max(last + 1, Number(new Date())));
  };
}());
util.str.parsejsonp = function (resp) {
  return JSON.parse(resp.replace(/^(try\s*\{)?[^{]*\(\{/, '{').replace(/}\)\s*;?\s*(}\s*catch\s*\(e\)\s*\{\s*\};?)?$/, '}'));
};

var network = {};
network.headers = function () {
  return {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    // 'Cookie': document.cookie,
    'Referer': location.href,
    'X-Requested-With': 'XMLHttpRequest',
  };
};

network.music = {};
network.music.get = function (id, callback) {
  GM_xmlhttpRequest({
    'method': 'GET',
    'url': url.songinfo.replace('{{id}}', id).replace('{{callback}}', util.str.fcb()),
    'headers': network.headers(),
    'onload': function (resp) {
      var data = util.str.parsejsonp(resp.responseText).data[0];
      callback(data);
    }
  });
};

var download = function (url, name) {
  GM_xmlhttpRequest({
    'method': 'GET',
    'url': url,
    'responseType': 'arraybuffer',
    'onload': function (resp) {
      try {
        var blob = new Blob([resp.response], { type: 'octet/stream' });
        var bloburl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.download = name;
        a.href = bloburl;
        document.body.appendChild(a);
        util.func.call(function () {
          try {
            a.click();
            a.parentNode.removeChild();
            URL.revokeObjectURL(bloburl);
          } catch (e) { }
        });
      } catch (e) { alert(e); }
    }
  });
};

var downloadMusic = function (id) {
  network.music.get(id, function (data) {
    download(data.mp3_url, data.songname + '.mp3');
  });
};

var active = function () {
  var likelite = Array.from(document.querySelectorAll('.PCD_mplayer .panel_area .li_item .opt_box .ico_ctrl.ico_like_lite:nth-child(1)'));
  likelite.forEach(function (s) {
    var d = document.createElement('div');
    d.innerHTML = '<a class="ico_ctrl ico_download" title="下载"></a>';
    d = d.firstChild;
    d.addEventListener('click', function (e) {
      var id = s.getAttribute('likeid').match(/(\d+_\d+)/)[1];
      downloadMusic(id);
      e.stopPropagation();
    });
    s.parentNode.insertBefore(d, s);
  });
  var iconlist = Array.from(document.querySelectorAll('.PCD_mplayer .contrl_panel .opt_ctrl .ico_list:nth-child(3)'));
  iconlist.forEach(function (i) {
    var d = document.createElement('div');
    d.innerHTML = '<a class="ico_ctrl ico_download" title="下载" href="javascript:void(0);"></a>';
    d = d.firstChild;
    d.addEventListener('click', function () {
      var href = document.querySelector('.PCD_mplayer .music_info .name').href;
      var f = document.createElement('a'); f.href = href;
      var id = f.pathname.match(/(\d+_\d+)/)[1];
      downloadMusic(id);
    });
    i.parentNode.insertBefore(d, i);
  });
};

(function main() {
  (new MutationObserver(active))
    .observe(document.body, { 'childList': true, 'subtree': true });
  GM_addStyle([
    '.PCD_mplayer .panel_area .li_item .opt_box .ico_ctrl { margin-left: 6px !important; }',
    '.PCD_mplayer .contrl_panel .opt_ctrl { margin-left: 0 !important; }',
    '.PCD_mplayer .contrl_panel .opt_ctrl .ico_list { margin-left: 9px !important; }',
    '.ico_download { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAKAgMAAADNzkZIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURUxpcczMzP///9XV1TvEVkwAAAABdFJOUwBA5thmAAAALklEQVQI12NgCGFgWsDAgJViDXXQWsXAwBjKwLUCISfAwNDAwBAaGr5q1QIoBQBzTg2/5E+q3QAAAABJRU5ErkJggg==) !important; background-position: 0 0; }',
    '.ico_download:hover { background-position: -11px 0; }',
    '.PCD_mplayer .contrl_panel .opt_ctrl .ico_download { display: inline-block; float: left; height: 10px; margin: 10px 0 0 10px; width: 11px; }',
    '.PCD_mplayer .ico_download { height: 11px; width: 11px; margin-right: 4px; }',
  ].join(''));
}())

