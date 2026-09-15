const grid=document.querySelector('#grid'),empty=document.querySelector('#empty'),count=document.querySelector('#count'),q=document.querySelector('#q'),quickCats=document.querySelector('#quickCats');
let products=[],filteredProducts=[],currentPage=1,currentCategory='',searchTerm='';
const DESKTOP_PAGE_SIZE=20, MOBILE_PAGE_SIZE=10;
const getPageSize=()=>window.matchMedia('(max-width: 520px)').matches?MOBILE_PAGE_SIZE:DESKTOP_PAGE_SIZE;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=n=>n!=null&&Number(n)>0?Number(n).toLocaleString('ko-KR')+'원':'';

function ensurePagination(){let el=document.querySelector('#pagination');if(!el){el=document.createElement('div');el.id='pagination';el.className='pagination';grid.insertAdjacentElement('afterend',el)}return el}
function renderPage(){
  const pageSize=getPageSize();
  const total=filteredProducts.length,totalPages=Math.max(1,Math.ceil(total/pageSize));
  if(currentPage>totalPages)currentPage=totalPages;
  count.textContent=`${total}개 상품`;
  grid.innerHTML=''; empty.classList.toggle('hidden',total>0);
  const start=(currentPage-1)*pageSize;
  for(const p of filteredProducts.slice(start,start+pageSize)){
    const el=document.createElement('article');el.className='product';
    el.innerHTML=`<img class="thumb" src="${p.thumbnail_url||'https://placehold.co/300x300?text=DoPick'}" alt="${esc(p.name)}"><div class="product-body"><div class="product-meta"><span class="product-code">${String(p.product_no).padStart(3,'0')}</span>${p.category?`<span class="product-category">${esc(p.category)}</span>`:''}</div><h3>${esc(p.name)}</h3>${fmt(p.price)?`<div class="price">${fmt(p.price)}</div>`:''}<p class="tagline">${esc(p.tags||p.description||'')}</p></div><a class="compact-buy" target="_blank" data-id="${p.id}" href="${p.affiliate_url}" aria-label="${esc(p.name)} 상품 보기"><span>상품보기</span><b>›</b></a>`;
    grid.appendChild(el)
  }
  renderPagination(totalPages);
}
function renderPagination(totalPages){
  const el=ensurePagination();
  if(totalPages<=1){el.innerHTML='';el.classList.add('hidden');return}
  el.classList.remove('hidden');
  let pages=[]; const from=Math.max(1,currentPage-2),to=Math.min(totalPages,currentPage+2);
  if(from>1)pages.push(`<button data-page="1">1</button>${from>2?'<span>…</span>':''}`);
  for(let i=from;i<=to;i++)pages.push(`<button data-page="${i}" class="${i===currentPage?'active':''}">${i}</button>`);
  if(to<totalPages)pages.push(`${to<totalPages-1?'<span>…</span>':''}<button data-page="${totalPages}">${totalPages}</button>`);
  el.innerHTML=`<button class="page-nav" data-page="${currentPage-1}" ${currentPage===1?'disabled':''}>‹ 이전</button>${pages.join('')}<button class="page-nav" data-page="${currentPage+1}" ${currentPage===totalPages?'disabled':''}>다음 ›</button>`;
  el.querySelectorAll('button[data-page]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.page);if(n>=1&&n<=totalPages&&n!==currentPage){currentPage=n;renderPage();document.querySelector('#products')?.scrollIntoView({behavior:'smooth',block:'start'})}})
}
function applyFilters(resetPage=true){
  const t=searchTerm.trim().toLowerCase();
  filteredProducts=products.filter(p=>(!currentCategory||p.category===currentCategory)&&(!t||[p.product_no,p.name,p.category,p.tags,p.description].join(' ').toLowerCase().includes(t)));
  if(resetPage)currentPage=1; renderPage();
  quickCats.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active',(b.dataset.c||'')===currentCategory));
}
function filter(t){searchTerm=t;applyFilters(true)}
async function load(){
  products=await(await fetch('/api/products')).json();filteredProducts=[...products];
  const cats=[...new Set(products.map(x=>x.category).filter(Boolean))];
  quickCats.innerHTML=`<button class="chip active" data-c="">전체</button>`+cats.map(c=>`<button class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  quickCats.querySelectorAll('button').forEach(b=>b.onclick=()=>{currentCategory=b.dataset.c||'';applyFilters(true)});
  renderPage();
}
document.querySelector('#searchBtn').onclick=()=>filter(q.value);q.addEventListener('keydown',e=>e.key==='Enter'&&filter(q.value));
document.querySelector('#requestForm').addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const j=await(await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})).json();document.querySelector('#requestMsg').textContent=j.ok?'요청이 접수됐습니다. 확인 후 연락드릴게요.':'전송에 실패했습니다.';if(j.ok)e.target.reset()});
let lastMobile=window.matchMedia('(max-width: 520px)').matches;
window.addEventListener('resize',()=>{const mobile=window.matchMedia('(max-width: 520px)').matches;if(mobile!==lastMobile){lastMobile=mobile;currentPage=1;renderPage()}});
window.setRequestType=t=>document.querySelector('[name="type"]').value=t;load();
