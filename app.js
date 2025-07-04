// app.js

// ===========================
// Clés localStorage & Constantes
// ===========================
const LS_LINKS_KEY = "mes_liens";
const LS_CATS_KEY  = "mes_categories";
const DEFAULT_CAT_COLOR = "#0ea5e9"; 
const DEFAULT_MAIN_CATEGORY_NAME = "À classer";
const DEFAULT_MAIN_CATEGORY_ICON_FILENAME = "LinkDruid.png"; 
const DEFAULT_GENERIC_ICON_FILENAME = ""; 

// Variables globales pour l'état du lien en cours d'édition/ajout
let currentLinkImageUrl = "";
let currentLinkIconFileName = "";

// Variables globales pour états de tri/recherche
let currentSortMode = "alpha-asc"; 
let currentCatSearch = "";         
let currentSettingsSortMode = "alpha-asc"; 
let currentSettingsCatSearch = "";     
let currentDisplayedLinkSortMode = 'default'; 

// Variables pour la modale de sélection d'icônes et les tags globaux
let iconModalCurrentSearch = "";
let iconModalCurrentSort = "alpha-asc"; 
let iconModalCurrentPreviewSize = 96; 
let areGlobalTagsVisible = false;
let activeGlobalTagFilter = []; 
let availableConfigFiles = []; 

// ============================
// FONCTIONS UTILITAIRES
// ============================
function getCollection(key) { const raw=localStorage.getItem(key);try{const p=raw?JSON.parse(raw):[];return Array.isArray(p)?p:[];}catch(e){console.error(`Err ${key}:`,e);return[];}}
function saveCollection(key,arr){try{if(!Array.isArray(arr)){console.error(`Not array ${key}`);return;}localStorage.setItem(key,JSON.stringify(arr));}catch(e){console.error(`Err save ${key}:`,e);}}

// ============================
// GESTION DES CATÉGORIES
// ============================
function normalizeCatsStorage(){const r=localStorage.getItem(LS_CATS_KEY);let cS=[];const dMC={name:DEFAULT_MAIN_CATEGORY_NAME,color:DEFAULT_CAT_COLOR,iconFileName:DEFAULT_MAIN_CATEGORY_ICON_FILENAME,isPinned:true};if(!r){cS=[dMC];}else{try{let p=JSON.parse(r);if(!Array.isArray(p))p=[];let mCF=false;cS=p.map(c=>{if(!c||typeof c.name!=='string'||c.name.trim()==="")return null;const tN=c.name.trim();const iMC=tN===DEFAULT_MAIN_CATEGORY_NAME;if(iMC)mCF=true;let i=typeof c.iconFileName==='string'?c.iconFileName.trim():(iMC?DEFAULT_MAIN_CATEGORY_ICON_FILENAME:DEFAULT_GENERIC_ICON_FILENAME);if(iMC&&c.iconUrl&&!c.iconFileName)i=DEFAULT_MAIN_CATEGORY_ICON_FILENAME;return{name:tN,color:(typeof c.color==='string'&&c.color.trim())?c.color.trim():DEFAULT_CAT_COLOR,iconFileName:i,isPinned:iMC?true:(typeof c.isPinned==='boolean'?c.isPinned:false)};}).filter(c=>c!==null);if(!mCF){cS.unshift({...dMC});}else{const mCI=cS.findIndex(c=>c.name===DEFAULT_MAIN_CATEGORY_NAME);if(mCI>-1){const mCD=cS.splice(mCI,1)[0];mCD.isPinned=true;mCD.color=mCD.color||DEFAULT_CAT_COLOR;mCD.iconFileName=mCD.iconFileName||DEFAULT_MAIN_CATEGORY_ICON_FILENAME;cS.unshift(mCD);}}}catch(e){cS=[dMC];console.error("Err normCats:",e);}}const uC=[];const nE=new Set();for(const c of cS){if(!nE.has(c.name)){nE.add(c.name);uC.push(c);}}saveCatsList(uC);return uC;}
function getCatsList(){const r=localStorage.getItem(LS_CATS_KEY);try{const p=r?JSON.parse(r):[];return Array.isArray(p)?p:[];}catch(e){return[{name:DEFAULT_MAIN_CATEGORY_NAME,color:DEFAULT_CAT_COLOR,iconFileName:DEFAULT_MAIN_CATEGORY_ICON_FILENAME,isPinned:true}];}}
function saveCatsList(list){localStorage.setItem(LS_CATS_KEY,JSON.stringify(list));}
function addCategory(catName,isPinnedByDefault=true){const l=getCatsList();if(!l.some(c=>c.name===catName)){l.push({name:catName,color:DEFAULT_CAT_COLOR,iconFileName:DEFAULT_GENERIC_ICON_FILENAME,isPinned:isPinnedByDefault});saveCatsList(l);}}
function renameCategory(oldName,newName){if(oldName===DEFAULT_MAIN_CATEGORY_NAME){alert(`"${DEFAULT_MAIN_CATEGORY_NAME}" non modifiable.`);return false;}if(newName===oldName)return true;if(newName.trim()===""){alert("Vide.");return false;}if(newName.length>32){alert(">32 car.");return false;}const l=getCatsList();if(l.some(c=>c.name===newName)){alert("Existe.");return false;}const uC=l.map(c=>c.name===oldName?{...c,name:newName}:c);saveCatsList(uC);let li=getCollection(LS_LINKS_KEY);li=li.map(link=>link.category===oldName?{...link,category:newName}:link);saveCollection(LS_LINKS_KEY,li);return true;}
function setCategoryIconFileName(catName,newIconFileName){const l=getCatsList();const u=l.map(c=>c.name===catName?{...c,iconFileName:newIconFileName}:c);saveCatsList(u);}
function deleteCategory(catName){if(catName===DEFAULT_MAIN_CATEGORY_NAME){alert(`"${DEFAULT_MAIN_CATEGORY_NAME}" non supp.`);return;}let l=getCatsList();l=l.filter(c=>c.name!==catName);saveCatsList(l);let li=getCollection(LS_LINKS_KEY);li=li.map(link=>link.category===catName?{...link,category:DEFAULT_MAIN_CATEGORY_NAME}:link);saveCollection(LS_LINKS_KEY,li);}
function togglePinCategory(catName){if(catName===DEFAULT_MAIN_CATEGORY_NAME)return;const l=getCatsList();const uL=l.map(cat=>cat.name===catName?{...cat,isPinned:!cat.isPinned}:cat);saveCatsList(uL);}

// ============================
// AFFICHAGE CATÉGORIES (SIDEBAR INDEX.HTML)
// ============================
function renderCatsList(sortMode="alpha-asc"){let aC=getCatsList();const mC=aC.find(c=>c.name===DEFAULT_MAIN_CATEGORY_NAME)||{name:DEFAULT_MAIN_CATEGORY_NAME,color:DEFAULT_CAT_COLOR,iconFileName:DEFAULT_MAIN_CATEGORY_ICON_FILENAME,isPinned:true};let p=aC.filter(c=>c.isPinned&&c.name!==DEFAULT_MAIN_CATEGORY_NAME);let u=aC.filter(c=>!c.isPinned&&c.name!==DEFAULT_MAIN_CATEGORY_NAME);const sF=(x,y)=>(sortMode==="alpha-asc"?x.name.localeCompare(y.name):y.name.localeCompare(x.name));p.sort(sF);u.sort(sF);let cD=[mC,...p,...u];if(currentCatSearch){const t=currentCatSearch.toLowerCase();cD=cD.filter(c=>c.name.toLowerCase().startsWith(t));}const params=new URLSearchParams(window.location.search);const activeCat=params.get("cat")||DEFAULT_MAIN_CATEGORY_NAME;const cont=document.getElementById("cats-list");if(!cont)return;cont.innerHTML="";cD.forEach(cO=>{const{name,color=DEFAULT_CAT_COLOR,iconFileName,isPinned}=cO;const eIF=iconFileName||(name===DEFAULT_MAIN_CATEGORY_NAME?DEFAULT_MAIN_CATEGORY_ICON_FILENAME:DEFAULT_GENERIC_ICON_FILENAME);const li=document.createElement("li");if(name===activeCat)li.classList.add("active");const pB=document.createElement("button");pB.className="material-symbols-outlined mr-1 p-1 rounded-full hover:bg-slate-200 active:bg-slate-300 transition-colors";pB.style.cssText="font-size:1rem;border:none;background:none;cursor:pointer;";pB.setAttribute("aria-label",isPinned?"Désépingler":"Épingler");if(name===DEFAULT_MAIN_CATEGORY_NAME){pB.style.visibility="hidden";}else{pB.textContent="push_pin";pB.title=isPinned?"Désépingler":"Épingler";pB.style.fontVariationSettings=isPinned?"'FILL' 1":"'FILL' 0";pB.classList.toggle("text-sky-500",isPinned);pB.classList.toggle("text-slate-400",!isPinned);pB.addEventListener("click",e=>{e.stopPropagation();togglePinCategory(name);renderCatsList(currentSortMode);updateAddLinkButtonHref();});}li.appendChild(pB);const iS=document.createElement("div");iS.className="cat-icon-square";if(eIF){iS.style.backgroundImage=`url('imgfix/${eIF}')`;iS.style.backgroundColor='transparent';}else{iS.style.backgroundImage='none';iS.style.backgroundColor=color;}li.appendChild(iS);const sL=document.createElement("span");sL.className="cat-label";sL.textContent=name;sL.addEventListener("click",()=>{window.location.href=`index.html?cat=${encodeURIComponent(name)}`;});li.appendChild(sL);cont.appendChild(li);});}
function initSortCatsButton(){const b=document.getElementById("sort-cats-btn");if(!b)return;b.onclick=()=>{currentSortMode=(currentSortMode==="alpha-asc"?"alpha-desc":"alpha-asc");b.innerHTML=`<span class="material-symbols-outlined">sort_by_alpha</span> Trier ${currentSortMode==='alpha-asc'?'A→Z':'Z→A'}`;renderCatsList(currentSortMode);updateAddLinkButtonHref();};}
function initAddCatButton(){const b=document.getElementById("btn-new-cat");if(!b)return;b.onclick=()=>{const nN=prompt("Nom:");if(!nN)return;const cN=nN.trim();if(cN===""){alert("Vide.");return;}if(cN.length>32){alert(">32.");return;}if(getCatsList().some(c=>c.name===cN)){alert("Existe.");return;}addCategory(cN,true);renderCatsList(currentSortMode);updateAddLinkButtonHref();};}
function initCatSearchInput(){const i=document.getElementById("cat-search-input");if(!i)return;i.oninput=()=>{currentCatSearch=i.value.trim();renderCatsList(currentSortMode);updateAddLinkButtonHref();};}

// ============================
// GESTION DES TAGS GLOBAUX (INDEX.HTML)
// ============================
function getAllUniqueTags(){const aL=getCollection(LS_LINKS_KEY);const tS=new Set();aL.forEach(l=>{if(Array.isArray(l.tags)){l.tags.forEach(t=>tS.add(t.trim()));}});return Array.from(tS).sort((a,b)=>a.localeCompare(b));}
function renderGlobalTags(){const c=document.getElementById("global-tags-container");const tB=document.getElementById("toggle-global-tags-btn");const tBt=document.getElementById("toggle-tags-btn-text");if(!c||!tB||!tBt)return;if(!areGlobalTagsVisible){c.innerHTML="";c.classList.add("hidden");tBt.textContent="Afficher les Tags";return;}c.classList.remove("hidden");tBt.textContent="Masquer les Tags";const tags=getAllUniqueTags();if(tags.length===0){c.innerHTML=`<p class="text-sm text-slate-500 italic px-1">Aucun tag.</p>`;return;}c.innerHTML="";const l=document.createElement('div');l.className="flex flex-wrap gap-2 pt-2 pb-1";const aB=document.createElement('button');aB.textContent="Tous";aB.className=`px-2.5 py-1 text-xs rounded-full border transition-colors duration-150 ${activeGlobalTagFilter.length===0?'bg-sky-500 text-white border-sky-500':'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'}`;aB.onclick=()=>{activeGlobalTagFilter=[];renderGlobalTags();renderLinks();};l.appendChild(aB);tags.forEach(t=>{const tE=document.createElement('button');tE.textContent=t;const iTA=activeGlobalTagFilter.includes(t);tE.className=`px-2.5 py-1 text-xs rounded-full border transition-colors duration-150 ${iTA?'bg-sky-500 text-white border-sky-500':'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'}`;tE.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey){if(iTA){activeGlobalTagFilter=activeGlobalTagFilter.filter(tag=>tag!==t);}else{activeGlobalTagFilter.push(t);}}else{if(iTA&&activeGlobalTagFilter.length===1){activeGlobalTagFilter=[];}else{activeGlobalTagFilter=[t];}}renderGlobalTags();renderLinks();});l.appendChild(tE);});c.appendChild(l);}
function initToggleGlobalTagsButton(){const tB=document.getElementById("toggle-global-tags-btn");if(tB){tB.onclick=()=>{areGlobalTagsVisible=!areGlobalTagsVisible;if(!areGlobalTagsVisible){activeGlobalTagFilter=[];renderLinks();}renderGlobalTags();};}}

// ============================
// AFFICHAGE DES LIENS (INDEX.HTML)
// ============================
function truncateText(s,mC){return !s?"":(s.length>mC?s.slice(0,mC-1)+"...":s);}
function filterLinks(links,keyword,activeCat,allCatsChecked){let fBC=allCatsChecked?links.slice():links.filter(l=>(l.category||DEFAULT_MAIN_CATEGORY_NAME)===activeCat);if(activeGlobalTagFilter.length>0){fBC=fBC.filter(l=>Array.isArray(l.tags)&&activeGlobalTagFilter.some(fT=>l.tags.includes(fT)));}if(!keyword)return fBC;const t=keyword.toLowerCase();const cT=document.getElementById("chk-title")?.checked;const cD=document.getElementById("chk-description")?.checked;const cTK=document.getElementById("chk-tags")?.checked;return fBC.filter(l=>{if(cT&&l.title&&l.title.toLowerCase().startsWith(t))return true;if(cD&&l.description&&l.description.toLowerCase().includes(t))return true;if(cTK&&Array.isArray(l.tags)&&l.tags.some(tag=>tag.toLowerCase().includes(t)))return true;return false;});}
function renderLinks(){
  const container = document.getElementById("links-container"); 
  if (!container) return;

  container.innerHTML = "";

  const allLiens = getCollection(LS_LINKS_KEY);
  const searchInput = document.getElementById("search-input");
  const keyword = searchInput ? searchInput.value.trim() : "";
  const params = new URLSearchParams(window.location.search);
  const activeCat = params.get("cat") || DEFAULT_MAIN_CATEGORY_NAME;
  const allCatsChecked = document.getElementById("chk-all-cats")?.checked;

  let liensFiltres = filterLinks(allLiens, keyword, activeCat, allCatsChecked);

  if (currentDisplayedLinkSortMode === 'title-asc') {
    liensFiltres.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (currentDisplayedLinkSortMode === 'title-desc') {
    liensFiltres.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  }

  if(liensFiltres.length===0){
    container.innerHTML=`<p class="text-slate-500 col-span-full text-center py-4">Aucun lien.</p>`;
    return;
  }

  liensFiltres.forEach(l => {
    const oI = allLiens.indexOf(l);
    const art = document.createElement("div");
    art.className = "link-card";

    const tE = document.createElement("h3");
    tE.className = "link-title";
    tE.textContent = truncateText(l.title, 24);
    art.appendChild(tE);

    const iW = document.createElement("div");
    iW.className = "link-image-wrapper";

    if (l.iconFileName) {
      iW.style.backgroundImage = `url('imgfix/${l.iconFileName}')`;
      iW.style.backgroundColor = 'transparent';
    } else if (l.imageUrl) {
      const fIU = l.imageUrl.startsWith('http') || l.imageUrl.startsWith('/') ? l.imageUrl : `http://localhost:3000/${l.imageUrl}`;
      iW.style.backgroundImage = `url('${fIU}')`;
      iW.style.backgroundColor = 'transparent';
    } else {
      const cats = getCatsList();
      const cO = cats.find(cat => cat.name === (l.category || DEFAULT_MAIN_CATEGORY_NAME));
      const cIF = cO?.iconFileName || DEFAULT_MAIN_CATEGORY_ICON_FILENAME;

      if (cIF) {
        iW.style.backgroundImage = `url('imgfix/${cIF}')`;
        iW.style.backgroundColor = 'transparent';
      } else {
        iW.style.backgroundImage = 'none';
        iW.style.backgroundColor = cO?.color || DEFAULT_CAT_COLOR;
      }
    }

    iW.onclick = () => window.open(l.url, "_blank");
    art.appendChild(iW);

    const aD = document.createElement("div");
    aD.className = "link-actions";

    const iB = document.createElement("button");
    iB.className = "info-btn";
    iB.innerHTML = `<span class="material-symbols-outlined">info</span><span>Info</span>`;
    iB.onclick = () => openInfoModal(l);
    aD.appendChild(iB);

    const eB = document.createElement("button");
    eB.className = "edit-btn";
    eB.innerHTML = `<span class="material-symbols-outlined">edit</span><span>Éditer</span>`;
    eB.onclick = () => {
      const pC = allCatsChecked ? "" : `&cat=${encodeURIComponent(activeCat)}`;
      window.location.href = `add.html?edit=${oI}${pC}`;
    };
    aD.appendChild(eB);

    const dB = document.createElement("button");
    dB.className = "delete-btn";
    dB.innerHTML = `<span class="material-symbols-outlined">delete</span><span>Supprimer</span>`;
    dB.addEventListener("click", evt => {
      if (evt.ctrlKey || evt.metaKey) {
        deleteLink(oI);
      } else {
        if (confirm("Supprimer lien?")) deleteLink(oI);
      }
    });
    aD.appendChild(dB);

    art.appendChild(aD);
    container.appendChild(art);
  });
}

function initSortLinksButton() {
    const sortBtn = document.getElementById("sort-links-btn");
    const sortBtnTextSpan = document.getElementById("sort-links-btn-text"); 
    if (!sortBtn || !sortBtnTextSpan) { console.warn("Bouton de tri des liens ou son texte non trouvé."); return; }
    const updateButtonText = () => {
        if (currentDisplayedLinkSortMode === 'title-asc') sortBtnTextSpan.textContent = "Liens A-Z";
        else if (currentDisplayedLinkSortMode === 'title-desc') sortBtnTextSpan.textContent = "Liens Z-A";
        else sortBtnTextSpan.textContent = "Tri par défaut";
    };
    updateButtonText();
    sortBtn.addEventListener('click', () => {
        if (currentDisplayedLinkSortMode === 'default') currentDisplayedLinkSortMode = 'title-asc';
        else if (currentDisplayedLinkSortMode === 'title-asc') currentDisplayedLinkSortMode = 'title-desc';
        else currentDisplayedLinkSortMode = 'default';
        updateButtonText();
        renderLinks();
    });
}
function openInfoModal(l){const o=document.getElementById("modal-overlay");const bD=document.getElementById("modal-body");if(!o||!bD)return;bD.innerHTML="";const tE=document.createElement("h2");tE.className="text-xl font-semibold text-slate-800";tE.textContent=l.title;bD.appendChild(tE);if(l.description&&l.description.trim()!==""){const dE=document.createElement("p");dE.className="mt-2 text-slate-700";dE.textContent=l.description;bD.appendChild(dE);}else{const nD=document.createElement("p");nD.className="mt-2 text-slate-500 italic";nD.textContent="(Pas de desc.)";bD.appendChild(nD);}if(Array.isArray(l.tags)&&l.tags.length>0){const tC=document.createElement("div");tC.className="mt-4 flex flex-wrap gap-2";l.tags.forEach(t=>{const sT=document.createElement("span");sT.className="bg-slate-200 text-slate-800 text-xs font-medium px-2 py-1 rounded-full";sT.textContent=t;tC.appendChild(sT);});bD.appendChild(tC);}else{const nT=document.createElement("p");nT.className="mt-2 text-slate-500 italic";nT.textContent="(Pas de tags)";bD.appendChild(nT);}o.style.display="flex";}
function closeInfoModal(){const o=document.getElementById("modal-overlay");if(o)o.style.display="none";}
function deleteLink(idx){let l=getCollection(LS_LINKS_KEY);if(idx>=0&&idx<l.length){l.splice(idx,1);saveCollection(LS_LINKS_KEY,l);renderLinks();}else{console.error(`Invalid idx: ${idx}`);}}

// ============================
// PAGE AJOUT / ÉDITION (ADD.HTML)
// ============================
function updateLinkImagePreview(previewContainer,iconFileName,imageUrl, removeBtnElement){
    if(!previewContainer)return;
    previewContainer.innerHTML=''; 
    const img=document.createElement('img'); img.alt="Aperçu"; img.className="max-h-32 max-w-full object-contain rounded";
    const dropZone=document.getElementById('drop-zone'); const orLabel=document.getElementById('link-image-preview-label-or');
    let imageIsSet = false;

    if(iconFileName){
        img.src=`imgfix/${iconFileName}`; previewContainer.appendChild(img);
        if(dropZone)dropZone.classList.add('hidden'); if(orLabel)orLabel.classList.add('hidden');
        imageIsSet = true;
    }else if(imageUrl){
        img.src=`http://localhost:3000/${imageUrl}`; previewContainer.appendChild(img);
        if(dropZone)dropZone.classList.remove('hidden'); if(orLabel)orLabel.classList.remove('hidden');
        imageIsSet = true;
    }else{
        previewContainer.innerHTML='<p class="text-slate-400 italic text-sm">Aucune image/icône.</p>';
        if(dropZone)dropZone.classList.remove('hidden'); if(orLabel)orLabel.classList.remove('hidden');
    }
    if(removeBtnElement){ 
        if(imageIsSet && !previewContainer.contains(removeBtnElement)) previewContainer.appendChild(removeBtnElement);
        removeBtnElement.classList.toggle('hidden', !imageIsSet);
    }
}
function initAddPage(){
  const form = document.getElementById("link-form"); if (!form) return; 
  const titreInput = document.getElementById("title"), urlInput = document.getElementById("url"), descInput = document.getElementById("description"), tagsInput = document.getElementById("tags"), catSelect = document.getElementById("category-select");
  const params = new URLSearchParams(window.location.search); const editIndex = params.get("edit");
  let initialCatFromUrl = params.get("cat") || DEFAULT_MAIN_CATEGORY_NAME; 
  const catLabel = document.getElementById("current-cat-label"); if (catLabel) catLabel.textContent = `Catégorie : ${initialCatFromUrl}`;
  const btnChooseLibIcon = document.getElementById("btn-choose-lib-icon"), linkPreviewContainer = document.getElementById("link-image-preview-container"), hiddenMiniUrlInput = document.getElementById("mini-url");
  const btnRemoveLinkImage = document.getElementById("btn-remove-link-image");
  currentLinkImageUrl = ""; currentLinkIconFileName = ""; 

  function populateCategorySelect() { let c=getCatsList();c.sort((a,b)=>a.name.localeCompare(b.name));if(!c.some(cat=>cat.name===initialCatFromUrl))initialCatFromUrl=DEFAULT_MAIN_CATEGORY_NAME;catSelect.innerHTML="";c.forEach(cat=>{const o=document.createElement("option");o.value=cat.name;o.textContent=cat.name;catSelect.append(o);});catSelect.value=initialCatFromUrl;}
  populateCategorySelect();

  if(editIndex !== null){ const l=getCollection(LS_LINKS_KEY)[editIndex]; if(l){ titreInput.value=l.title; urlInput.value=l.url; descInput.value=l.description||""; tagsInput.value=(l.tags||[]).join(", "); const cS=l.category||DEFAULT_MAIN_CATEGORY_NAME; catSelect.value=cS; initialCatFromUrl=cS; if(catLabel)catLabel.textContent=`Catégorie : ${initialCatFromUrl}`; currentLinkImageUrl=l.imageUrl||""; currentLinkIconFileName=l.iconFileName||""; if(hiddenMiniUrlInput)hiddenMiniUrlInput.value=currentLinkImageUrl;}}
  updateLinkImagePreview(linkPreviewContainer, currentLinkIconFileName, currentLinkImageUrl, btnRemoveLinkImage);

  if(btnChooseLibIcon){btnChooseLibIcon.addEventListener('click',()=>{openIconLibraryModal('ce lien',currentLinkIconFileName,(chosenIcon)=>{currentLinkIconFileName=chosenIcon;currentLinkImageUrl="";if(hiddenMiniUrlInput)hiddenMiniUrlInput.value="";updateLinkImagePreview(linkPreviewContainer,currentLinkIconFileName,currentLinkImageUrl, btnRemoveLinkImage);});});}
  if(btnRemoveLinkImage){btnRemoveLinkImage.addEventListener('click',()=>{currentLinkIconFileName="";currentLinkImageUrl="";if(hiddenMiniUrlInput)hiddenMiniUrlInput.value="";updateLinkImagePreview(linkPreviewContainer,currentLinkIconFileName,currentLinkImageUrl, btnRemoveLinkImage);document.getElementById('drop-zone')?.classList.remove('hidden');document.getElementById('link-image-preview-label-or')?.classList.remove('hidden');});}
  const dropZone=document.getElementById("drop-zone"),fileInput=document.getElementById("file-input");
  if(dropZone&&fileInput){dropZone.onclick=()=>fileInput.click();dropZone.ondragover=(e)=>{e.preventDefault();dropZone.classList.add("over");};dropZone.ondragleave=()=>dropZone.classList.remove("over");dropZone.ondrop=(e)=>{e.preventDefault();dropZone.classList.remove("over");const f=e.dataTransfer.files[0];if(f)uploadLinkImageToServer(f);};fileInput.onchange=(e)=>{const f=e.target.files[0];if(f)uploadLinkImageToServer(f);};}
  function uploadLinkImageToServer(file){const fd=new FormData();fd.append("imageFile",file);fetch("http://localhost:3000/upload",{method:"POST",body:fd}).then(r=>r.json()).then(d=>{if(d.miniUrl){currentLinkImageUrl=d.miniUrl;currentLinkIconFileName="";if(hiddenMiniUrlInput)hiddenMiniUrlInput.value=d.miniUrl;updateLinkImagePreview(linkPreviewContainer,currentLinkIconFileName,currentLinkImageUrl, btnRemoveLinkImage);}else alert("Err upload: "+(d.error||"URL?"));}).catch(err=>{console.error("Link img upload err:",err);alert("Pb upload.");});}

  form.onsubmit=(e)=>{e.preventDefault();const titre=titreInput.value.trim(),url=urlInput.value.trim();if(!titre||!url){alert("Titre/URL requis!");return;}
    let tagsArray = tagsInput.value.split(",").map(t=>t.trim()).filter(t=>t.length > 0);
    const category = catSelect.value || DEFAULT_MAIN_CATEGORY_NAME;
    if (category !== DEFAULT_MAIN_CATEGORY_NAME) { const categoryAsTag = category; if (!tagsArray.some(tag => tag.toLowerCase() === categoryAsTag.toLowerCase())) { tagsArray.push(categoryAsTag); }}
    const newLien={title:titre,url:url,description:descInput.value.trim(),tags:tagsArray,category:category,imageUrl:currentLinkImageUrl,iconFileName:currentLinkIconFileName};
    let liens=getCollection(LS_LINKS_KEY);if(editIndex!==null){liens[editIndex]=newLien;}else{liens.push(newLien);};saveCollection(LS_LINKS_KEY,liens);window.location.href=`index.html?cat=${encodeURIComponent(newLien.category)}`;};
}

// ============================
// MODALE SÉLECTION ICÔNES (IMGFIX)
// ============================
async function openIconLibraryModal(contextName,currentIconFileName,onIconChosenCallback){const eM=document.getElementById("icon-choice-modal-overlay");if(eM)eM.remove();iconModalCurrentSearch="";const mO=document.createElement('div');mO.id="icon-choice-modal-overlay";mO.className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4";const mC=document.createElement('div');mC.className="bg-white p-4 sm:p-5 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col";const tE=document.createElement('h3');tE.className="text-lg sm:text-xl font-semibold mb-4 text-slate-800";tE.textContent=`Choisir une icône pour "${contextName}"`;mC.appendChild(tE);const cC=document.createElement('div');cC.className="flex flex-col sm:flex-row gap-3 mb-4 items-center";const sW=document.createElement('div');sW.className="relative flex-grow w-full sm:w-auto";const sIS=document.createElement('span');sIS.className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none";sIS.textContent="search";const sI=document.createElement('input');sI.type="text";sI.placeholder="Rechercher icône...";sI.className="w-full h-10 pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm shadow-sm";sI.value=iconModalCurrentSearch;sI.addEventListener('input',()=>{iconModalCurrentSearch=sI.value.toLowerCase();renderIconsInModal(lG,iFNA,currentIconFileName,onIconChosenCallback);});sW.appendChild(sIS);sW.appendChild(sI);cC.appendChild(sW);const sB=document.createElement('button');sB.className="h-10 px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 flex items-center gap-1.5 whitespace-nowrap shadow-sm";const sISpan=document.createElement('span');sISpan.className="material-symbols-outlined text-base";sISpan.textContent="sort_by_alpha";sB.appendChild(sISpan);const sBT=document.createElement('span');sBT.textContent=iconModalCurrentSort==='alpha-asc'?"A-Z":"Z-A";sB.appendChild(sBT);sB.addEventListener('click',()=>{iconModalCurrentSort=iconModalCurrentSort==='alpha-asc'?'alpha-desc':'alpha-asc';sBT.textContent=iconModalCurrentSort==='alpha-asc'?"A-Z":"Z-A";renderIconsInModal(lG,iFNA,currentIconFileName,onIconChosenCallback);});cC.appendChild(sB);const sCW=document.createElement('div');sCW.className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[220px]";const sISpan2=document.createElement('span');sISpan2.className="material-symbols-outlined text-slate-600";sISpan2.textContent="photo_size_select_large";const sS=document.createElement('input');sS.type="range";sS.min="48";sS.max="256";sS.step="8";sS.value=String(iconModalCurrentPreviewSize);sS.className="flex-grow h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1";sS.addEventListener('input',()=>{iconModalCurrentPreviewSize=parseInt(sS.value);lG.style.setProperty('--icon-modal-preview-size',`${iconModalCurrentPreviewSize}px`);const nFS=Math.max(8,Math.min(11,iconModalCurrentPreviewSize/9));lG.style.setProperty('--icon-modal-name-font-size',`${nFS}px`);});sCW.appendChild(sISpan2);sCW.appendChild(sS);cC.appendChild(sCW);mC.appendChild(cC);const lG=document.createElement('div');lG.className="grid overflow-y-auto flex-grow p-2 bg-slate-100 rounded-md border border-slate-200 gap-2.5";lG.style.gridTemplateColumns=`repeat(auto-fill, minmax(var(--icon-modal-preview-size, ${iconModalCurrentPreviewSize}px), 1fr))`;lG.style.setProperty('--icon-modal-preview-size',`${iconModalCurrentPreviewSize}px`);const iNFS=Math.max(8,Math.min(11,iconModalCurrentPreviewSize/9));lG.style.setProperty('--icon-modal-name-font-size',`${iNFS}px`);mC.appendChild(lG);const clB=document.createElement('button');clB.className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 self-end text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm";clB.textContent="Fermer";clB.addEventListener('click',()=>mO.remove());mC.appendChild(clB);mO.appendChild(mC);document.body.appendChild(mO);mO.addEventListener('click',e=>{if(e.target===mO)mO.remove();});let iFNA=[];try{const res=await fetch('/api/available-icons');if(!res.ok)throw new Error('API?');iFNA=await res.json();renderIconsInModal(lG,iFNA,currentIconFileName,onIconChosenCallback);}catch(err){lG.innerHTML="<p class='text-red-600 col-span-full text-center py-4'>Err load.</p>";}}
function renderIconsInModal(gC,aIFN,cSIC,oICC){gC.innerHTML='';let fASN=[...aIFN];if(iconModalCurrentSearch){fASN=fASN.filter(fN=>fN.toLowerCase().includes(iconModalCurrentSearch));}if(iconModalCurrentSort==='alpha-asc'){fASN.sort((a,b)=>a.localeCompare(b));}else if(iconModalCurrentSort==='alpha-desc'){fASN.sort((a,b)=>b.localeCompare(a));}if(fASN.length===0){gC.innerHTML="<p class='text-slate-500 col-span-full text-center py-4'>Aucune.</p>";return;}fASN.forEach(fN=>{const iW=document.createElement('div');iW.className=`p-1.5 border rounded-md cursor-pointer hover:bg-sky-100 transition-all flex flex-col items-center justify-start ${fN===cSIC?'ring-2 ring-offset-1 ring-sky-500 bg-sky-50':'border-slate-300 hover:border-sky-400'}`;iW.style.minHeight=`calc(var(--icon-modal-preview-size) + 2rem)`;const iC=document.createElement('div');iC.className="flex items-center justify-center flex-grow w-full";iC.style.height=`var(--icon-modal-preview-size)`;const i=document.createElement('img');i.src=`imgfix/${fN}`;i.alt=fN;i.title=fN;i.className="max-w-full max-h-full object-contain pointer-events-none";iC.appendChild(i);const nL=document.createElement('p');nL.textContent=fN;nL.className="text-slate-700 text-center truncate w-full px-0.5 leading-tight pt-1";nL.style.fontSize=`var(--icon-modal-name-font-size)`;nL.title=fN;iW.appendChild(iC);iW.appendChild(nL);iW.addEventListener('click',()=>{oICC(fN);const mO=document.getElementById("icon-choice-modal-overlay");if(mO)mO.remove();});gC.appendChild(iW);});}

// ============================
// PAGE RÉGLAGES CATÉGORIES (CATEGORIES.HTML)
// ============================
function renderCatsSettingsList(){let aC=getCatsList();const mC=aC.find(c=>c.name===DEFAULT_MAIN_CATEGORY_NAME)||{name:DEFAULT_MAIN_CATEGORY_NAME,color:DEFAULT_CAT_COLOR,iconFileName:DEFAULT_MAIN_CATEGORY_ICON_FILENAME,isPinned:true};let oC=aC.filter(c=>c.name!==DEFAULT_MAIN_CATEGORY_NAME);if(currentSettingsCatSearch){const t=currentSettingsCatSearch.toLowerCase();oC=oC.filter(c=>c.name.toLowerCase().startsWith(t));}let p=oC.filter(c=>c.isPinned);let u=oC.filter(c=>!c.isPinned);const sF=(x,y)=>(currentSettingsSortMode==="alpha-asc"?x.name.localeCompare(y.name):y.name.localeCompare(x.name));p.sort(sF);u.sort(sF);const lD=[mC,...p,...u];const cont=document.getElementById("settings-cats-list");if(!cont)return;cont.innerHTML="";if(lD.length===0){cont.innerHTML="<p>Err.</p>";return;}lD.forEach(cO=>{const{name,color=DEFAULT_CAT_COLOR,iconFileName,isPinned}=cO;const eF=iconFileName||(name===DEFAULT_MAIN_CATEGORY_NAME?DEFAULT_MAIN_CATEGORY_ICON_FILENAME:DEFAULT_GENERIC_ICON_FILENAME);const li=document.createElement("li");const pW=document.createElement("div");pW.className="cat-pin-btn-container";if(name!==DEFAULT_MAIN_CATEGORY_NAME){const pB=document.createElement("button");pB.className=`cat-pin-btn material-symbols-outlined ${isPinned?'pinned':'not-pinned'}`;pB.textContent="push_pin";pB.title=isPinned?"Désépingler":"Épingler";pB.setAttribute("aria-label",isPinned?`Désépingler ${name}`:`Épingler ${name}`);pB.onclick=()=>{togglePinCategory(name);renderCatsSettingsList();};pW.appendChild(pB);}li.appendChild(pW);const iW=document.createElement("div");iW.className="cat-icon-square";if(eF){iW.style.backgroundImage=`url('imgfix/${eF}')`;iW.style.backgroundColor='transparent';}else{iW.style.backgroundImage='none';iW.style.backgroundColor=color;}iW.title=`Icône pour "${name}"`;iW.style.cursor="pointer";iW.onclick=()=>{openIconLibraryModal(name,eF,(cF)=>{setCategoryIconFileName(name,cF);renderCatsSettingsList();});};li.appendChild(iW);const iN=document.createElement("input");iN.type="text";iN.value=name;iN.maxLength=32;iN.className="cat-input-name";if(name===DEFAULT_MAIN_CATEGORY_NAME)iN.disabled=true;iN.onblur=()=>{if(name===DEFAULT_MAIN_CATEGORY_NAME)return;const nN=iN.value.trim();if(nN&&nN!==name){if(!renameCategory(name,nN))iN.value=name;else renderCatsSettingsList();}else iN.value=name;};li.appendChild(iN);const dW=document.createElement("div");dW.className="cat-delete-btn-container";if(name!==DEFAULT_MAIN_CATEGORY_NAME){const dB=document.createElement("button");dB.className="cat-delete-btn material-symbols-outlined";dB.textContent="delete";dB.title=`Supprimer "${name}"`;dB.setAttribute("aria-label",`Supprimer ${name}`);dB.addEventListener("click",evt=>{if(evt.ctrlKey||evt.metaKey){deleteCategory(name);renderCatsSettingsList();}else{if(confirm(`Supprimer "${name}"? Les liens seront déplacés vers "${DEFAULT_MAIN_CATEGORY_NAME}".`)){deleteCategory(name);renderCatsSettingsList();}}});dW.appendChild(dB);}li.appendChild(dW);const exportBtnContainer=document.createElement("div");exportBtnContainer.className="cat-export-btn-container";if(name!==DEFAULT_MAIN_CATEGORY_NAME){const exportBtn=document.createElement("button");exportBtn.innerHTML='<span class="material-symbols-outlined">ios_share</span>';exportBtn.title=`Exporter catégorie "${name}"`;exportBtn.onclick=()=>{exportSingleCategory(name);};exportBtnContainer.appendChild(exportBtn);}li.appendChild(exportBtnContainer);cont.appendChild(li);});}
function initCatSettingsControls() {
  const sI = document.getElementById("cat-settings-search-input");
  const sB = document.getElementById("sort-cats-settings-btn");

  if (sI) {
    sI.value = currentSettingsCatSearch;
    sI.oninput = () => {
      currentSettingsCatSearch = sI.value.trim();
      renderCatsSettingsList();
    };
  }

  if (sB) {
    sB.innerHTML = `<span class="material-symbols-outlined">sort_by_alpha</span> Trier ${currentSettingsSortMode === 'alpha-asc' ? 'A→Z' : 'Z→A'}`;
    sB.onclick = () => {
      currentSettingsSortMode = currentSettingsSortMode === 'alpha-asc' ? 'alpha-desc' : 'alpha-asc';
      sB.innerHTML = `<span class="material-symbols-outlined">sort_by_alpha</span> Trier ${currentSettingsSortMode === 'alpha-asc' ? 'A→Z' : 'Z→A'}`;
      renderCatsSettingsList();
    };
  }
}
function initAddNewCategoryButtonSettings(){const b=document.getElementById("btn-new-cat-settings");if(!b)return;b.onclick=()=>{const n=prompt("Nom:");if(!n)return;const c=n.trim();if(c==="")return;if(c.length>32)return;if(getCatsList().some(cat=>cat.name===c)){alert("Existe.");return;}addCategory(c,false);renderCatsSettingsList();};}

// ============================
// EXPORT / IMPORT / RESET CONFIGURATION
// ============================
function downloadJson(data,filename){const jS=JSON.stringify(data,null,2);const b=new Blob([jS],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=filename||"linkdruid_config.json";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);}
function exportAllData(){const c=getCatsList();const l=getCollection(LS_LINKS_KEY);const eD={version:"linkdruid_config_v1.1",timestamp:new Date().toISOString(),categories:c,links:l};downloadJson(eD,`linkdruid_backup_${new Date().toISOString().slice(0,10)}.json`);}
function exportSingleCategory(categoryName){const cats=getCatsList();const catToExp=cats.find(c=>c.name===categoryName);if(!catToExp){alert(`Catégorie "${categoryName}" non trouvée.`);return;}const allLinks=getCollection(LS_LINKS_KEY);const linksToExp=allLinks.filter(link=>link.category===categoryName);const expData={version:"linkdruid_config_v1.1_single_cat",timestamp:new Date().toISOString(),categories:[catToExp],links:linksToExp};downloadJson(expData,`linkdruid_cat_${categoryName.replace(/\s+/g,'_')}.json`);}
function importData(jsonData){try{const dTI=typeof jsonData==='string'?JSON.parse(jsonData):jsonData;if(!dTI||(!dTI.version)||!Array.isArray(dTI.categories)||!Array.isArray(dTI.links)){alert("Format invalide.");return;}let cC=getCatsList();let cL=getCollection(LS_LINKS_KEY);let nCA=0;let nLA=0;const catsToImport=dTI.categories;catsToImport.forEach(iC=>{const eC=cC.find(c=>c.name===iC.name);if(!eC){cC.push({name:iC.name,color:iC.color||DEFAULT_CAT_COLOR,iconFileName:iC.iconFileName||(iC.name===DEFAULT_MAIN_CATEGORY_NAME?DEFAULT_MAIN_CATEGORY_ICON_FILENAME:DEFAULT_GENERIC_ICON_FILENAME),isPinned:typeof iC.isPinned==='boolean'?iC.isPinned:(iC.name===DEFAULT_MAIN_CATEGORY_NAME)});nCA++;}else{if(eC.name!==DEFAULT_MAIN_CATEGORY_NAME){eC.color=iC.color||eC.color;eC.iconFileName=iC.iconFileName||eC.iconFileName;eC.isPinned=typeof iC.isPinned==='boolean'?iC.isPinned:eC.isPinned;}}});saveCatsList(cC);dTI.links.forEach(iL=>{const iD=cL.some(l=>l.url===iL.url&&l.title===iL.title);if(!iD){const cE=cC.some(c=>c.name===iL.category);cL.push({title:iL.title,url:iL.url,description:iL.description||"",tags:Array.isArray(iL.tags)?iL.tags:[],category:cE?iL.category:DEFAULT_MAIN_CATEGORY_NAME,imageUrl:iL.imageUrl||"",iconFileName:iL.iconFileName||""});nLA++;}});saveCollection(LS_LINKS_KEY,cL);alert(`Import!\nCatégories: ${nCA}\nLiens: ${nLA}`);renderAll();}catch(e){console.error("Err import:",e);alert("Err import.");}}
function handleImportFile(e){const f=e.target.files[0];if(f){const r=new FileReader();r.onload=evt=>{importData(evt.target.result);};r.readAsText(f);e.target.value=null;}}
function resetAllData(){if(confirm("ATTENTION! TOUT supprimer?")){localStorage.removeItem(LS_CATS_KEY);localStorage.removeItem(LS_LINKS_KEY);activeGlobalTagFilter=[];alert("Données réinitialisées.");window.location.reload();}}
async function fetchAvailableConfigs(){try{const r=await fetch('/api/available-configs');if(!r.ok)throw new Error('API configs?');availableConfigFiles=await r.json();populateConfigSelector();}catch(e){console.error("Err fetchConfigs:",e);const cS=document.getElementById("config-file-selector");if(cS)cS.innerHTML='<option value="">Err load</option>';}}
function populateConfigSelector(){const s=document.getElementById("config-file-selector");const lB=document.getElementById("load-selected-config-btn");if(!s||!lB)return;s.innerHTML='<option value="">Choisir config...</option>';if(availableConfigFiles.length===0){s.innerHTML='<option value="">Aucune</option>';lB.disabled=true;return;}availableConfigFiles.forEach(fN=>{const o=document.createElement("option");o.value=fN;o.textContent=fN.replace(/\.json$/i,'');s.appendChild(o);});lB.disabled=s.value==="";s.onchange=()=>{lB.disabled=s.value==="";};}
async function loadSelectedConfig(){const s=document.getElementById("config-file-selector");if(!s||!s.value){alert("Sélectionner config.");return;}const fN=s.value;if(confirm(`Charger "${fN}"? (Fusionnera les données)`)){try{const r=await fetch(`config/${fN}`);if(!r.ok)throw new Error(`Err load ${fN}`);const cD=await r.json();importData(cD);}catch(e){console.error(`Err load config ${fN}:`,e);alert(`Err load: ${e.message}`);}}}
function renderAll(){renderCatsList(currentSortMode);renderLinks();renderGlobalTags();if(document.body.id==='page-categories')renderCatsSettingsList();updateAddLinkButtonHref();}

// ============================
// INITIALISATION GLOBALE & MISE À JOUR ADD LINK BUTTON
// ============================
function updateAddLinkButtonHref(){const aLB=document.querySelector('header.header-main nav a[href^="add.html"]');if(aLB){const p=new URLSearchParams(window.location.search);const cGC=p.get('cat')||DEFAULT_MAIN_CATEGORY_NAME;aLB.href=`add.html?cat=${encodeURIComponent(cGC)}`;}}
document.addEventListener("DOMContentLoaded",()=>{const bI=document.body.getAttribute("id");normalizeCatsStorage();if(bI==="page-home"){initSortCatsButton();initAddCatButton();initCatSearchInput();initToggleGlobalTagsButton();initSortLinksButton();document.getElementById("chk-all-cats")?.addEventListener("change",renderLinks);document.getElementById("chk-title")?.addEventListener("change",renderLinks);document.getElementById("chk-description")?.addEventListener("change",renderLinks);document.getElementById("chk-tags")?.addEventListener("change",renderLinks);document.getElementById("search-input")?.addEventListener("input",renderLinks);document.getElementById("modal-close-btn")?.addEventListener("click",closeInfoModal);document.getElementById("modal-overlay")?.addEventListener("click",e=>{if(e.target.id==="modal-overlay")closeInfoModal();});document.getElementById("export-all-btn")?.addEventListener("click",exportAllData);const iFI=document.getElementById("import-file-input");if(iFI)iFI.addEventListener("change",handleImportFile);document.getElementById("reset-all-btn")?.addEventListener("click",resetAllData);fetchAvailableConfigs();document.getElementById("load-selected-config-btn")?.addEventListener("click",loadSelectedConfig);renderAll();}else if(bI==="page-categories"){initCatSettingsControls();renderCatsSettingsList();initAddNewCategoryButtonSettings();}else if(bI==="page-add"){initAddPage();}window.addEventListener('popstate',()=>{if(document.body.getAttribute("id")==="page-home"){renderAll();}});});