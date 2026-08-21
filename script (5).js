const ADMIN_PASSWORD = "admin123"; // change this before deploying

const TOOLS = [
  {id:"word-counter", name:"Word Counter", desc:"Count words, characters, sentences instantly.", url:"word-counter.html"},
  {id:"case-converter", name:"Case Converter", desc:"Switch between UPPER, lower, Title case.", url:"case-converter.html"},
  {id:"percentage-calculator", name:"Percentage Calculator", desc:"Quick percentage math.", url:"percentage-calculator.html"},
  {id:"qr-code-generator", name:"QR Code Generator", desc:"Turn any link or text into a QR code.", url:"qr-code-generator.html"},
  {id:"base64-encoder-decoder", name:"Base64 Encoder/Decoder", desc:"Encode or decode text to Base64.", url:"base64-encoder-decoder.html"},
  {id:"link-generator", name:"Link Generator", desc:"Shorten a URL and turn it into a QR code.", url:"link-generator.html"},
  {id:"qr-code-scanner", name:"QR Code Scanner", desc:"Upload a QR image to reveal the link inside it.", url:"qr-code-scanner.html"},
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

/* Pre-fill QR input if arriving from Link Generator with ?value= */
function prefillQRFromQuery(){
  const qrInputEl = document.getElementById("qrInput");
  if(!qrInputEl) return;
  const params = new URLSearchParams(window.location.search);
  const val = params.get("value");
  if(val){
    qrInputEl.value = val;
    genQR();
  }
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

/* ---------- Link Generator ---------- */
async function shortenLink(){
  const input = document.getElementById("lgInput").value.trim();
  const errorEl = document.getElementById("lgError");
  const resultBox = document.getElementById("lgResultBox");
  errorEl.style.display = "none";
  resultBox.style.display = "none";

  if(!input){ errorEl.textContent = "Please paste a URL first."; errorEl.style.display = "block"; return; }
  let url = input;
  if(!/^https?:\/\//i.test(url)) url = "https://" + url;

  try{
    const res = await fetch("https://is.gd/create.php?format=json&url=" + encodeURIComponent(url));
    const data = await res.json();
    if(data.shorturl){
      document.getElementById("lgOutput").value = data.shorturl;
      resultBox.style.display = "block";
    } else {
      errorEl.textContent = "Couldn't shorten this link. Check the URL and try again.";
      errorEl.style.display = "block";
    }
  } catch(e){
    errorEl.textContent = "Network error — the shortening service may be unavailable right now.";
    errorEl.style.display = "block";
  }
}
function sendToQR(){
  const link = document.getElementById("lgOutput").value;
  if(!link) return;
  window.location.href = "qr-code-generator.html?value=" + encodeURIComponent(link);
}

async function textToLink(){
  const text = document.getElementById("lgTextInput").value;
  const errorEl = document.getElementById("lgTextError");
  const resultBox = document.getElementById("lgTextResultBox");
  errorEl.style.display = "none";
  resultBox.style.display = "none";

  if(!text.trim()){ errorEl.textContent = "Please enter some text first."; errorEl.style.display = "block"; return; }

  const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(text))));
  const longLink = window.location.origin + window.location.pathname.replace("link-generator.html","") + "view-text.html?data=" + encoded;

  try{
    const res = await fetch("https://is.gd/create.php?format=json&url=" + encodeURIComponent(longLink));
    const data = await res.json();
    document.getElementById("lgTextOutput").value = data.shorturl || longLink;
  } catch(e){
    document.getElementById("lgTextOutput").value = longLink;
  }
  resultBox.style.display = "block";
}

/* ---------- QR Code Scanner ---------- */
function scanQRImage(event){
  const file = event.target.files[0];
  const errorEl = document.getElementById("qrScanError");
  const resultBox = document.getElementById("qrScanResultBox");
  const preview = document.getElementById("qrScanPreview");
  errorEl.style.display = "none";
  resultBox.style.display = "none";
  preview.innerHTML = "";
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      preview.innerHTML = "";
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.maxWidth = "220px";
      canvas.style.borderRadius = "8px";
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      preview.appendChild(canvas);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if(code){
        document.getElementById("qrScanOutput").value = code.data;
        resultBox.style.display = "block";
      } else {
        errorEl.textContent = "Couldn't detect a QR code in this image. Try a clearer photo.";
        errorEl.style.display = "block";
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function openScannedLink(){
  const val = document.getElementById("qrScanOutput").value;
  if(/^https?:\/\//i.test(val)) window.open(val, "_blank");
  else alert("This QR code doesn't contain a clickable link.");
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
  prefillQRFromQuery();
});
