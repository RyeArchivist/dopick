const $=s=>document.querySelector(s);let key=sessionStorage.getItem('dopick_admin')||'';const headers=()=>({'Content-Type':'application/json','X-Admin-Key':key});
let categories=[];
let adminProductList=[];
function renderCategories(selected=''){
  const sel=$('#categorySelect');
  sel.innerHTML='<option value="">카테고리 선택</option>'+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')+'<option value="__new__">+ 새 카테고리 추가</option>';
  if(selected) sel.value=selected;
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function syncNewCategory(){const isNew=$('#categorySelect').value==='__new__';$('#newCategoryWrap').classList.toggle('hidden',!isNew);$('#newCategory').required=isNew;if(!isNew)$('#newCategory').value=''}
async function check(){const r=await fetch('/api/products?admin=1',{headers:{'X-Admin-Key':key}});if(r.status===401)throw Error();$('#loginBox').classList.add('hidden');$('#adminArea').classList.remove('hidden');loadProducts();loadRequests()}
$('#loginBtn').onclick=async()=>{key=$('#adminKey').value.trim();sessionStorage.setItem('dopick_admin',key);try{await check()}catch{$('#loginMsg').textContent='관리자 키를 확인해주세요.'}};
if(key)check().catch(()=>sessionStorage.removeItem('dopick_admin'));
$('#categorySelect').addEventListener('change',syncNewCategory);
$('#productForm').addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const selected=$('#categorySelect').value;f.category=selected==='__new__'?$('#newCategory').value.trim():selected;if(!f.category){$('#productMsg').textContent='카테고리를 선택하거나 새로 입력해주세요.';return}f.featured=e.target.featured.checked;const r=await fetch('/api/products',{method:'POST',headers:headers(),body:JSON.stringify(f)});let j={ok:false};try{j=await r.json()}catch{}$('#productMsg').textContent=j.ok?'등록 완료':'등록 실패'+(j.error?` · ${j.error}`:'');if(j.ok){e.target.reset();$('#newCategoryWrap').classList.add('hidden');await loadProducts()}});
async function loadProducts(){const r=await fetch('/api/products?admin=1',{headers:{'X-Admin-Key':key}});if(!r.ok){$('#productMsg').textContent='상품 목록을 불러오지 못했습니다. D1 DB 연결과 테이블을 확인해주세요.';return}adminProductList=await r.json();categories=[...new Set(adminProductList.map(p=>(p.category||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));renderCategories();renderProductFilter();renderAdminProducts()}
function renderProductFilter(){const filter=$('#productCategoryFilter');if(!filter)return;const current=filter.value;filter.innerHTML='<option value="">전체 카테고리</option>'+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');if(categories.includes(current))filter.value=current}
function renderAdminProducts(){const filter=$('#productCategoryFilter')?.value||'';const list=filter?adminProductList.filter(p=>(p.category||'')===filter):adminProductList;$('#adminProducts').innerHTML=list.length?list.map(p=>`<div class="admin-row"><img src="${escapeHtml(p.thumbnail_url||'https://placehold.co/160')}"><div><b>${String(p.product_no).padStart(3,'0')} · ${escapeHtml(p.name)}</b><br><small>${escapeHtml(p.category||'')} · ${Number(p.price||0).toLocaleString()}원</small></div><div class="inline"><button class="btn secondary" onclick="toggleProduct(${p.id},${p.active?0:1})">${p.active?'숨김':'공개'}</button><button class="btn secondary" onclick="deleteProduct(${p.id},'${escapeHtml(p.name).replace(/'/g,'&#39;')}')">삭제</button></div></div>`).join(''):'<p class="muted">해당 카테고리에 등록된 상품이 없습니다.</p>'}
async function toggleProduct(id,active){await fetch('/api/products',{method:'PUT',headers:headers(),body:JSON.stringify({id,active})});loadProducts()}
async function deleteProduct(id,name){if(!confirm(`「${name}」 상품을 정말 삭제할까요?\n삭제하면 복구할 수 없습니다.`))return;const r=await fetch('/api/products',{method:'DELETE',headers:headers(),body:JSON.stringify({id})});let j={ok:false};try{j=await r.json()}catch{}if(!r.ok||!j.ok){alert('상품 삭제에 실패했습니다.');return}await loadProducts()}
async function loadRequests(){const r=await fetch('/api/requests',{headers:{'X-Admin-Key':key}});if(!r.ok)return;const list=await r.json();$('#adminRequests').innerHTML=list.map(x=>`<div class="admin-row"><div><small>${escapeHtml(x.type)}</small></div><div><b>${escapeHtml(x.product_name)}</b><br><small>${escapeHtml(x.contact||'연락처 없음')} · ${escapeHtml(x.created_at)}</small><br>${escapeHtml(x.message||'')}</div><div>${x.product_url?`<a class="btn secondary" target="_blank" href="${escapeHtml(x.product_url)}">링크</a>`:''}</div></div>`).join('')}
$('#reloadProducts').onclick=loadProducts;$('#reloadRequests').onclick=loadRequests;

$('#productCategoryFilter').addEventListener('change',renderAdminProducts);
