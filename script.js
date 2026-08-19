const ADMIN_PASSWORD = "admin123"; // change this before deploying

const TOOLS = [
  {id:"word-counter", name:"Word Counter", desc:"Count words, characters, sentences instantly.", url:"word-counter.html"},
  {id:"case-converter", name:"Case Converter", desc:"Switch between UPPER, lower, Title case.", url:"case-converter.html"},
  {id:"percentage-calculator", name:"Percentage Calculator", desc:"Quick percentage math.", url:"percentage-calculator.html"},
  {id:"qr-code-generator", name:"QR Code Generator", desc:"Turn any link or text into a QR code.", url:"qr-code-generator.html"},
  {id:"base64-encoder-decoder", name:"Base64 Encoder/Decoder", desc:"Encode or decode text to Base64.", url:"base64-encoder-decoder.html"},
];

function loadSiteSettings(){
  const saved = JSON.parse(localStorage.getItem("qt_settings") || "{}");
  const titleEl = document.getElementById("siteTitle");
  if(titleEl) titleEl.innerHTML = saved.siteTitle || 'Quick<span>Tools</span>';
  const annEl = document.getElementById("announcement");
  if(annEl && saved.announcement){
    annEl.style.display = "block";
    annEl.textContent = saved.announcement;
  }
  return saved;
}

function renderHomeGrid(){
  const grid = document.getElementById("toolGrid");
  if(!grid) return;
  const saved = JSON.parse(localStorage.getItem("qt_settings") || "{}");
  const visibility = saved.toolVisibility || {};
  grid.innerHTML = "";
  TOOLS.forEach(t => {
    if(visibility[t.id] === false) return;
    const a = document.createElement("a");
    a.className = "card";
    a.href = t.url;
    a.innerHTML = `<h3>${t.name}</h3><p>${t.desc}</p>`;
    grid.appendChild(a);
  });
}

/* ---------- Word Counter ---------- */
function updateWC(){
  const text = document.getElementById("wcInput").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById("wcWords").textContent = words;
  document.getElementById("wcChars").textContent = text.length;
  document.getElementById("wcCharsNoSpace").textContent = text.replace(/\s/g,"").length;
  document.getElementById("wcSentences").textContent = (text.match(/[.!?]+/g) || []).length;
  document.getElementById("wcParas").textContent = text.split(/\n+/).filter(p=>p.trim()).length;
}

/* ---------- Case Converter ---------- */
function convertCase(type){
  const el = document.getElementById("caseInput");
  let t = el.value;
  if(type === "upper") t = t.toUpperCase();
  else if(type === "lower") t = t.toLowerCase();
  else if(type === "title") t = t.replace(/\w\S*/g, w => w[0].toUpperCase()+w.slice(1).toLowerCase());
  else if(type === "sentence") t = t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  el.value = t;
}
function copyText(id){ navigator.clipboard.writeText(document.getElementById(id).value); }

/* ---------- Percentage ---------- */
function calcPercent(){
  const a = parseFloat(document.getElementById("pA").value) || 0;
  const b = parseFloat(document.getElementById("pB").value) || 0;
  document.getElementById("pResult").textContent = ((a/100)*b).toFixed(2);
}

/* ---------- QR Code ---------- */
function genQR(){
  const out = document.getElementById("qrOut");
  out.innerHTML = "";
  const val = document.getElementById("qrInput").value;
  if(!val) return;
  new QRCode(out, { text: val, width: 180, height: 180 });
}

/* ---------- Base64 ---------- */
function b64Encode(){
  try{ document.getElementById("b64Output").value = btoa(document.getElementById("b64Input").value); }
  catch(e){ document.getElementById("b64Output").value = "Error: invalid characters"; }
}
function b64Decode(){
  try{ document.getElementById("b64Output").value = atob(document.getElementById("b64Input").value); }
  catch(e){ document.getElementById("b64Output").value = "Error: invalid Base64 input"; }
}

/* ---------- Admin panel ---------- */
function openAdminLogin(){ document.getElementById("loginModal").classList.add("active"); }
function closeModal(id){ document.getElementById(id).classList.remove("active"); }
function tryLogin(){
  const val = document.getElementById("adminPass").value;
  if(val === ADMIN_PASSWORD){
    closeModal("loginModal");
    openAdminPanel();
  } else {
    alert("Wrong password");
  }
}
function openAdminPanel(){
  document.getElementById("adminBanner").style.display = "block";
  const saved = JSON.parse(localStorage.getItem("qt_settings") || "{}");
  document.getElementById("adminSiteTitle").value = (document.getElementById("siteTitle") ? document.getElementById("siteTitle").textContent : "QuickTools");
  document.getElementById("adminAnnouncement").value = saved.announcement || "";
  const togglesDiv = document.getElementById("adminToolToggles");
  togglesDiv.innerHTML = "";
  const visibility = saved.toolVisibility || {};
  TOOLS.forEach(t => {
    const isOn = visibility[t.id] !== false;
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `<span>${t.name}</span><div class="toggle ${isOn?'on':''}" data-id="${t.id}" onclick="this.classList.toggle('on')"><span></span></div>`;
    togglesDiv.appendChild(row);
  });
  document.getElementById("adminModal").classList.add("active");
}
function saveAdminSettings(){
  const siteTitle = document.getElementById("adminSiteTitle").value;
  const announcement = document.getElementById("adminAnnouncement").value;
  const toolVisibility = {};
  document.querySelectorAll("#adminToolToggles .toggle").forEach(t => {
    toolVisibility[t.dataset.id] = t.classList.contains("on");
  });
  localStorage.setItem("qt_settings", JSON.stringify({siteTitle, announcement, toolVisibility}));
  loadSiteSettings();
  renderHomeGrid();
  closeModal("adminModal");
}
function closeAdmin(){
  document.getElementById("adminBanner").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  loadSiteSettings();
  renderHomeGrid();
});
