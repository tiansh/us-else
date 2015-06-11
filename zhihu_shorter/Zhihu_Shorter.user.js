// ==UserScript==
// @name        ZhiHu Shorter
// @name:zh-cn  知乎短答案
// @description 我讨厌长篇大论
// @namespace   https://github.com/tiansh
// @include     http://www.zhihu.com/*
// @updateURL   http://tiansh.github.io/us-else/zhihu_shorter/Zhihu_Shorter.meta.js
// @downloadURL http://tiansh.github.io/us-else/zhihu_shorter/Zhihu_Shorter.user.js
// @homepageURL http://tiansh.github.io/us-else/zhihu_shorter/
// @supportURL  https://github.com/tiansh/us-else/issues/
// @version     1.0
// @copyright   田生; Copyright (c) All Rights Reserved
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/**!
 * 本来打算按照 （赞同 - 反对）/字数 的，结果拿不到反对数量。
 * 所以修正公式，令 反对 := 赞同 。
 * 测试表明，优化后的排序相比优化前，在前 1 分钟的查看答案过程中可以找到的有效信息，提高了40% 。
 *
 * 本脚本欢迎任何人以任意方式分发，但不得改作后散播。
 */

var maxCount = 500;

// 检查是否已经登录
var isLogin = function () {
  return !document.querySelector('.js-signin-noauth');
};

// 对象转请求参数
var param = function (data) {
  return Object.keys(data).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
  }).join('&');
};

// 显示更多回答
var showMoreWOLogin = function () {
  if (document.querySelectorAll('.zm-item-answer').length > maxCount) return;
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
      if (resp.msg.length < 20) {
        document.querySelector('.zu-button-more').style.display = 'none';
      } else showMoreWOLogin();
    }
  });
};

// 显示更多回答
var showMoreWLogin = function () {
  if (document.querySelectorAll('.zm-item-answer').length > maxCount) return;
  console.log('showmore w login');
  var more = document.querySelector('.zu-button-more[aria-role="button"]');
  if (more && !more.classList.contains('loading')) setTimeout(function () { more.click(); }, 0);
  setTimeout(showMoreWLogin, 20);
};

var showCollasped = function () {
  var ex = document.querySelector('#zh-question-collapsed-switcher[name="expand"]');
  ex.click();
}

var countWords = function countWords() {
  var answers = document.querySelectorAll('.zm-item-answer:not([data-wordcount])');
  for (var i = 0, l = answers.length; i < l; i++) {
    var text = String(answers[i].querySelector('.zm-editable-content').textContent);
    var wc = text.length - Math.floor((text.match(/[\u32-\u127]/g) || '').length / 2);
    answers[i].setAttribute('data-wordcount', wc);
    answers[i].style.order = wc;
  }
  setTimeout(countWords, 20);
};

(function () {
  if (isLogin()) showMoreWLogin(); else showMoreWOLogin();
  countWords();
}());

GM_addStyle(' #zh-question-answer-wrap { display: flex; flex-direction: column; } #zh-question-answer-wrap .zm-item-answer { order: 9999999; } ');

