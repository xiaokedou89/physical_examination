// 基于屏幕1920设计图
window.onload = function () {
  getRem();
};

window.onresize = function () {
  getRem();
}
console.log('rem is loading')
function getRem() {
  let html = document.getElementsByTagName('html')[0];
  let width = document.body.clientWidth || document.documentElement.clientWidth;
  // html.style.fontSize = owidth / pwidth * prem + 'px';
  html.style.fontSize = width / 100 + 'px';
}