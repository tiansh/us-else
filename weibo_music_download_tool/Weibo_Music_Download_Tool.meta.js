// ==UserScript==
// @name              Weibo Music Download Tool
// @name:zh-CN        微博音乐下载
// @namespace         https://github.com/tiansh/
// @description       下载微博 weibo.com 上的音乐
// @description:zh-CN 下载微博 weibo.com 上的音乐
// @icon              data:image/png;base64,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
// @include           http://www.weibo.com/*
// @include           http://weibo.com/*
// @include           http://d.weibo.com/*
// @include           http://s.weibo.com/*
// @exclude           http://weibo.com/a/bind/*
// @exclude           http://weibo.com/nguide/*
// @exclude           http://weibo.com/
// @version           1.1
// @grant             GM_xmlhttpRequest
// @grant             GM_addStyle
// @grant             unsafeWindow
// @run-at            document-end
// @compatible        opera
// @compatible        firefox
// @compatible        chrome
// @homepageURL       http://tiansh.github.io/us-else/weibo_music_download_tool/
// @downloadURL       https://tiansh.github.io/us-else/weibo_music_download_tool/Weibo_Music_Download_Tool.user.js
// @updateURL         https://tiansh.github.io/us-else/weibo_music_download_tool/Weibo_Music_Download_Tool.meta.js
// @supportURL        https://github.com/tiansh/us-else/issues
// @author            田生 http://weibo.com/tsh90
// @copyright         田生; The MIT License
// @license           The MIT License (MIT); http://opensource.org/licenses/MIT
// ==/UserScript==

