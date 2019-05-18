var btn = document.querySelector('#click-test');

function handler() {
  var cnt = 0;
  return function() {
    alert(++cnt)
  }
}

btn.addEventListener('click', handler(), false);