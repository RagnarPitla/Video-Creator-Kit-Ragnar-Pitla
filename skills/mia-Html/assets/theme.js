(function(){
  var root=document.documentElement, btn=document.getElementById('themeBtn'),
      icon=document.getElementById('themeIcon'), txt=document.getElementById('themeTxt');
  function paint(t){
    root.setAttribute('data-theme',t);
    icon.innerHTML=(t==='dark')?'&#9788;':'&#9789;';
    txt.textContent=(t==='dark')?'Light':'Dark';
  }
  try{var s=localStorage.getItem('mia-theme'); if(s){paint(s);}}catch(e){}
  btn.addEventListener('click',function(){
    var n=root.getAttribute('data-theme')==='dark'?'light':'dark';
    paint(n); try{localStorage.setItem('mia-theme',n);}catch(e){}
  });
})();
