// A fixed-position list above the dock; unaffected by dock overflow scrolling.
(() => {
  const select = document.getElementById('music-track');
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'music-picker';
  button.className = 'btn-fluid dock-secondary';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'music-list');
  button.style.cssText = 'max-width:210px;overflow:hidden;text-overflow:ellipsis';
  select.hidden = true;
  select.after(button);
  const list = document.createElement('div');
  list.id = 'music-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', '활동 음악 선택');
  list.hidden = true;
  list.style.cssText = 'position:fixed;z-index:100;background:#1e293b;color:#f8fafc;border:1px solid #64748b;border-radius:12px;padding:6px;overflow:auto;box-shadow:0 12px 32px #0008';
  document.body.appendChild(list);
  function label() { button.textContent = (select.selectedOptions[0]?.textContent || '음악 선택') + ' ▴'; }
  function close(restore = false) {list.hidden = true;button.setAttribute('aria-expanded','false');if(restore)button.focus();}
  function position() {
    const r = button.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 16);
    list.style.width = width + 'px';
    list.style.left = Math.max(8,Math.min(r.left,window.innerWidth-width-8)) + 'px';
    list.style.bottom = (window.innerHeight - r.top + 8) + 'px';
    list.style.maxHeight = Math.max(30,Math.min(280,r.top-16)) + 'px';
  }
  function open() {
    list.replaceChildren();
    for (const option of select.options) {
      const item = document.createElement('button');
      item.type = 'button';item.textContent = option.textContent;
      item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.selected));
      item.style.cssText = 'display:block;width:100%;padding:10px;text-align:left;border:0;border-radius:7px;color:inherit;white-space:normal;background:'+(option.selected?'#334155':'transparent');
      item.onclick = e => {e.stopPropagation();select.value=option.value;select.dispatchEvent(new Event('change'));label();close(true);};
      list.appendChild(item);
    }
    list.hidden=false;position();button.setAttribute('aria-expanded','true');
    (list.querySelector('[aria-selected="true"]') || list.firstElementChild)?.focus();
  }
  button.onclick = e => {e.stopPropagation();list.hidden?open():close();};
  button.onkeydown = e => {if(['ArrowUp','ArrowDown','Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();open();}};
  list.onkeydown = e => {
    e.stopPropagation();
    if(e.code==='Escape'){e.preventDefault();close(true);return;}
    if(e.code==='Tab'){close();return;}
    const items=[...list.children], index=items.indexOf(document.activeElement);
    const next=e.code==='ArrowDown'?Math.min(items.length-1,index+1):e.code==='ArrowUp'?Math.max(0,index-1):e.code==='Home'?0:e.code==='End'?items.length-1:-1;
    if(next>=0){e.preventDefault();items[next]?.focus();}
  };
  document.addEventListener('pointerdown',e=>{if(!list.contains(e.target)&&!button.contains(e.target))close();});
  window.addEventListener('resize',()=>{if(!list.hidden)position();});
  document.addEventListener('scroll',()=>{if(!list.hidden)position();},true);
  select.addEventListener('change',label);
  new MutationObserver(label).observe(select,{childList:true,subtree:true});
  label();
})();
