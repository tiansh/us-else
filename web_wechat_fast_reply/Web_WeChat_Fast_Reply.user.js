// ==UserScript==
// @name           Web WeChat Fast Reply
// @description    网页微信右键菜单快速回复预设内容，鼠标右键点击聊天窗口显示菜单
// @name:zh        网页微信快捷回复
// @description:zh 网页微信右键菜单快速回复预设内容，鼠标右键点击聊天窗口显示菜单
// @namespace      https://github.com/tiansh
// @include        https://wx.qq.com/*
// @downloadURL    https://tiansh.github.io/us-else/web_wechat_fast_reply/Web_WeChat_Fast_Reply.user.js
// @updateURL      https://tiansh.github.io/us-else/web_wechat_fast_reply/Web_WeChat_Fast_Reply.meta.js
// @supportURL     https://github.com/tiansh/us-else/issues
// @homepageURL    https://tiansh.github.io/us-else/web_wechat_fast_reply/
// @version        1.1
// @noframes
// @compatible     firefox
// @license        MPL 2.0
// @author         田生
// @copyright      田生; https://github.com/tiansh
// @grant          GM_getValue
// @grant          GM_setValue
// ==/UserScript==

(function mina() {
  
  if (!('contextMenu' in document.createElement('div'))) alert('抱歉，微信快捷回复脚本不支持您的浏览器！');
  if (!document.querySelector('#chat')) setTimeout(mina, 10);

  const menu = ((() => {
    const container = document.createElement('div');
    container.innerHTML = '<menu type="context" id="wechat-fast-input-menu"></menu>';
    return document.body.parentNode.appendChild(container.firstChild);
  })());
  
  const items = {
    data: [],
    _add(text) {
      if (!text) return;
      this._remove(text);
      this.data.push(text);
    },
    add(text) {
      try {
      this._add(prompt(text));
      this.update();
      } catch (e) { alert(e); }
    },
    _remove(text) {
      this.data = this.data.filter(x => x !== text);
    },
    remove(text) {
      this._remove(text);
      this.update();
    },
    act(text) {
      const input = document.querySelector('#textInput');
      const button = input.parentNode.querySelector('.chatSend');
      input.value = text; button.click();
    },
    update() {
      GM_setValue('text', JSON.stringify(this.data));
      
      const item = (r, t, i, f) => {
        const x = document.createElement(f ? 'menuitem' : 'menu');
        x.label = (Number.isInteger(i) && i < 10 ? '' + (i + 1) % 10 + ': ' : '') + t;
        if (f) x.addEventListener('click', f.bind(this, t));
        return r.appendChild(x);
      };
      const all = (r, f) => this.data.map((t, i) => item(r, t, i, f));
      
      menu.innerHTML = '';
      
      all(menu, this.act);
      item(menu, '添加快捷回复', undefined, this.add);
      all(item(menu, '删除快捷回复'), this.remove);
    },
    init() {
      try {
        this.data = Array.from(JSON.parse(GM_getValue('text', '[]')))
      } catch (_) { }
      this.update();
    }
  };
  
  const chat = document.querySelector('#chat');
  chat.setAttribute('contextmenu', 'wechat-fast-input-menu');
  items.init();

}());

