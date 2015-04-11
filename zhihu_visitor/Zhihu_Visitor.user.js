// ==UserScript==
// @namespace         https://github.com/tiansh
// @name              Zhihu Visitor
// @name:en           Zhihu Visitor
// @name:zh           知乎免登录
// @name:zh-CN        知乎免登录
// @description       知乎免登录查看回答全文
// @description:en    View zhihu.com answers without sign in
// @description:zh    知乎免登录查看回答全文并显示更多回答
// @description:zh-CN 知乎免登录查看回答全文并显示更多回答
// @include           http://www.zhihu.com/*
// @updateURL         http://tiansh.github.io/us-else/zhihu_visitor/Zhihu_Visitor.meta.js
// @downloadURL       http://tiansh.github.io/us-else/zhihu_visitor/Zhihu_Visitor.user.js
// @homepageURL       http://tiansh.github.io/us-else/zhihu_visitor/
// @supportURL        https://github.com/tiansh/us-else/issues/
// @version           2.1
// @grant             GM_addStyle
// @grant             GM_xmlhttpRequest
// ==/UserScript==

var matches = (function () {
  var ep = Element.prototype, matches = ep.matches ||
    ep.mozMatchesSelector || ep.oMatchesSelector ||
    ep.webkitMatchesSelector || ep.msMatchesSelector;
  return function (element, selector) {
    try { return matches.call(element, [selector]); }
    catch (e) { return null; }
  };
}());

// 隐藏掉会员功能按钮
var hideNeedLogin = function () {
  GM_addStyle(function () { /*!
    .zm-votebar .label, .zm-votebar .vote-arrow, .zm-votebar .down, .zm-comment-form { display: none; }
    .zm-votebar .count { top: 8px; }
    .zm-votebar .up { height: 40px; }
    .zm-votebar .up, .zm-votebar .down { cursor: auto; }
    html.no-touch .zm-votebar .up:hover, html.no-touch .zm-votebar .down:hover, .zm-votebar .up.pressed, .zm-votebar .down.pressed { color: #698ebf; background: #eff6fa; }
    .feed-item .zm-votebar { display: block; }
    .zm-votebar::after { content: " "; height: 40px; width: 38px; display: block; margin-top: -40px; position: relative; }
    
    .meta-item[name="thanks"], .meta-item[name="share"], .meta-item[name="favo"], .meta-item[name="nohelp"], .meta-item[name="report"], .zm-meta-panel > .zg-bull { display: none; }

    .toggle-expand { display: none !important; }

    .zu-button-more:active { background: none repeat scroll 0 0 #ddd; box-shadow: none; cursor: auto; }

    .zm-item-answer + .zm-item-answer .fixed-summary.fixed-summary-show, .awesome-answer-list .fixed-summary.fixed-summary-show { max-height: none; cursor: auto; }
    .zm-item-answer + .zm-item-answer .fixed-summary.fixed-summary-toshow .origin_image, .awesome-answer-list .fixed-summary.fixed-summary-toshow .origin_image { cursor: pointer; }
    .zm-item-answer + .zm-item-answer .fixed-summary.fixed-summary-toshow::after, .awesome-answer-list .fixed-summary.fixed-summary-toshow::after { content: "▼ 更多 　"; background: #eee; width: 100%; height: 20px; line-height: 20px; text-align: center; color: #777; position: absolute; top: calc(10em - 20px); }
   */ }.toString().split(/\r\n|\r|\n/).slice(1, -1).join('\n'));
};

// 检查是否已经登录，如果已经登录那么脚本什么都不用做
var isLogin = function () {
  return !document.querySelector('.js-signin-noauth');
};

// 初始化某条的展开
var expandAnswer = function (fixed) {
  var height = fixed.clientHeight;
  fixed.classList.add('fixed-summary-show');
  setTimeout(function () {
    if (fixed.clientHeight === height) return;
    fixed.classList.remove('fixed-summary-show');
    fixed.classList.add('fixed-summary-toshow');
  }, 0);
};

// 初始化已存在的回答们
var initAnswers = function () {
  var fixed = document.querySelectorAll('.zm-item-answer + .zm-item-answer .fixed-summary, .awesome-answer-list .fixed-summary');
  Array.prototype.forEach.call(fixed, expandAnswer);
};

// 修正答案区域的展开
var showFullAnswer = function () {
  document.addEventListener('click', function handler(e) {
    var target = e.target;
    var oriImg = matches(target, '.origin_image');
    var inAnswer = matches(target, '.fixed-summary, .fixed-summary *');
    var toShow = matches(target, '.fixed-summary-toshow, .fixed-summary-toshow *');
    if (toShow || (inAnswer && !oriImg)) {
      e.preventDefault(); e.stopPropagation();
    }
    if (!toShow) return;
    var fixed;
    for (fixed = target; ; fixed = fixed.parentNode) {
      if (!fixed || !fixed.classList) return;
      if (matches(fixed, '.fixed-summary-toshow')) break;
    }
    fixed.classList.remove('fixed-summary-toshow');
    fixed.classList.add('fixed-summary-show');
    fixed.removeEventListener('click', handler, true);
  }, true);
};

// 对象转请求参数
var param = function (data) {
  return Object.keys(data).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
  }).join('&');
};

// 没有更多答案时隐藏按钮
var noMoreAnswer = function () {
  var button = document.querySelector('.zu-button-more');
  button.style.display = 'none';
};

// 显示评论
var showComment = function (ans) {
  var id = ans.getAttribute('data-aid');
  var metaPanel = ans.querySelector('.zm-meta-panel');
  metaPanel.className = 'zm-meta-panel goog-scrollfloater focusin';
  var commentBox = document.createElement('div');
  commentBox.innerHTML = '<div class="zm-comment-box" style=""><i class="icon icon-spike zm-comment-bubble"></i><div class="zm-comment-spinner">正在加载，请稍等 <i class="spinner-lightgray"></i></div></div>';
  commentBox = metaPanel.parentNode.insertBefore(commentBox.firstChild, metaPanel.nextSibling);
  GM_xmlhttpRequest({
    'method': 'GET',
    'url': 'http://www.zhihu.com/node/AnswerCommentBoxV2?params={%22answer_id%22%3A%22' + id + '%22%2C%22load_all%22%3Afalse}',
    'onload': function (resp) { commentBox.outerHTML = resp.responseText; },
  });
};

// 显示回答时修复回答中的一些链接什么的
var fixAnswer = function (ans) {
  // 解决图片延迟加载问题
  var imgs = ans.querySelectorAll('img[data-actualsrc]');
  Array.prototype.forEach.call(imgs, function (img) {
    img.setAttribute('src', img.getAttribute('data-actualsrc'));
  });
  // 解决评论按钮无法展开的问题
  var page = ans.querySelector('.answer-date-link').href;
  var cmt = ans.querySelector('.toggle-comment');
  cmt.addEventListener('click', showComment.bind(null, ans));
  // 最后修复手动展开的问题（和一开始就有的回答一样）
  expandAnswer(ans.querySelector('.fixed-summary'));
};

// 显示某条回答
var showAnswer = function (ans) {
  var lastAnswer = document.querySelectorAll('.zm-item-answer');
  lastAnswer = lastAnswer[lastAnswer.length - 1];
  var ref = lastAnswer.nextSibling;
  var newAnswerWrap = document.createElement('div');
  newAnswerWrap.innerHTML = ans;
  var newAnswer = newAnswerWrap.firstChild;
  fixAnswer(newAnswer);
  ref.parentNode.insertBefore(newAnswer, ref);
};

// 显示更多回答
var showMore = function () {
  var offset = document.querySelectorAll('.zm-item-answer').length;
  var pagesize = 20;
  var url_token = Number(location.pathname.match(/\/(\d+)$/)[1]);
  var params = JSON.stringify({
    'url_token': url_token,
    'pagesize': pagesize,
    'offset': offset,
  });

  var _xsrf = document.querySelector('input[name="_xsrf"]').value;

  var data = {
    '_xsrf': _xsrf,
    'method': 'next',
    'params': params
  };

  GM_xmlhttpRequest({
    'method': 'POST',
    'url': 'http://www.zhihu.com/node/QuestionAnswerListV2',
    'headers': {
      'Referer': location.href,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    'data': param(data),
    'onload': function (response) {
      var resp = JSON.parse(response.responseText);
      resp.msg.forEach(showAnswer);
      if (resp.msg.length < 20) noMoreAnswer();
    }
  });
};

// 显示更多回答的按钮
var showMoreButton = function () {
  document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('zu-button-more')) return;
    e.stopPropagation(); e.preventDefault();
    showMore();
  }, true);
};

// 恢复显示原图功能
// FIXME 网站原本可以在当前页查看图片的，而且右键点击也可以在当前页显示
//       现在为了避免左击出登录框所以干脆新页面打开了
var showLargeImage = function () {
  document.body.addEventListener('click', function (e) {
    var target = e.target;
    if (!matches(target, '.origin_image')) return;
    e.preventDefault(); e.stopPropagation();
    window.open(target.getAttribute('data-original'), '_blank');
  }, true);
};

// 显示大图
var mina = function () {
  // 必须有登录按钮才工作
  if (isLogin()) return;
  hideNeedLogin();
  showFullAnswer();
  initAnswers();
  showMoreButton();
  showLargeImage();
};

if (['complete', 'loaded', 'interactive'].indexOf(document.readyState) !== -1) mina();
else window.addEventListener('DOMContentLoaded', mina);
