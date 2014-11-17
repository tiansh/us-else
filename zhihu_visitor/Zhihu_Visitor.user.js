// ==UserScript==
// @name              Zhihu Visitor
// @namespace         https://github.com/tiansh
// @description       知乎免登录查看回答全文
// @name:zh           知乎免登录
// @name:zh-CN        知乎免登录
// @description:en    View zhihu.com answers without sign in
// @description:zh-CN 知乎免登录查看回答全文
// @include           http://www.zhihu.com/*
// @version           1.0
// @grant             GM_addStyle
// ==/UserScript==

var mina = function () {
  // 必须有登录按钮才工作
  if (!document.querySelector('.js-signin-noauth')) return;

  // 首先隐藏掉会员功能按钮
  GM_addStyle(function () { /*!
    
    .zm-votebar .label, .zm-votebar .vote-arrow, .zm-votebar .down { display: none; }
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
    .zm-item-answer + .zm-item-answer .fixed-summary.fixed-summary-toshow::after, .awesome-answer-list .fixed-summary.fixed-summary-toshow::after { content: "▼ 更多 　"; background: #eee; width: 100%; height: 20px; line-height: 20px; text-align: center; color: #777; position: absolute; top: calc(10em - 20px); }

   */ }.toString().split(/\r\n|\r|\n/).slice(1, -1).join('\n'));

  var fixed = document.querySelectorAll('.zm-item-answer + .zm-item-answer .fixed-summary, .awesome-answer-list .fixed-summary');
  var expand = function (fixed) {
    var height = fixed.clientHeight;
    fixed.classList.add('fixed-summary-show');
    setTimeout(function () {
      if (fixed.clientHeight === height) return;
      fixed.classList.remove('fixed-summary-show');
      fixed.classList.add('fixed-summary-toshow');
    }, 0);
  };
  for (var i = 0, l = fixed.length; i < l; i++) expand(fixed[i]);
  document.addEventListener('click', function handler(e) {
    var fixed;
    for (fixed = e.target; ; fixed = fixed.parentNode) {
      if (!fixed || !fixed.classList) return;
      if (fixed.classList.contains('fixed-summary')) break;
    }
    e.preventDefault(); e.stopPropagation();
    if (!fixed.classList.contains('fixed-summary-toshow')) return;
    fixed.classList.remove('fixed-summary-toshow');
    fixed.classList.add('fixed-summary-show');
    fixed.removeEventListener('click', handler, true);
  }, true);
};

if (['complete', 'loaded', 'interactive'].indexOf(document.readyState) !== -1) mina();
else window.addEventListener('DOMContentLoaded', mina);
