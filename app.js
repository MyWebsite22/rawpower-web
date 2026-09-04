import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// Configuración de Firebase integrada correctamente
const firebaseConfig = {
  apiKey: "AIzaSyCHZtsDB60GMxFfqo15xgYtO1rXigWril0",
  authDomain: "gatm-fit-pro.firebaseapp.com",
  projectId: "gatm-fit-pro",
  storageBucket: "gatm-fit-pro.firebasestorage.app",
  messagingSenderId: "366212182391",
  appId: "1:366212182391:web:4d30a33a7123501a7df172"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

let state = { profile: {}, progress: [], plan: null };
let currentUser = null;
let mode = "login";

const toast = msg => {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
};

function goAuth(next = "login") {
  mode = next;
  $("#publicApp").classList.add("hidden");
  $("#appScreen").classList.add("hidden");
  $("#authScreen").classList.remove("hidden");
  $$(".auth-switch button").forEach(x => x.classList.toggle("active", x.dataset.authMode === mode));
  $("#authSubmit").textContent = mode === "login" ? "Entrar" : "Crear mi cuenta";
}

function goLanding() {
  $("#authScreen").classList.add("hidden");
  $("#appScreen").classList.add("hidden");
  $("#publicApp").classList.remove("hidden");
}

function goApp() {
  $("#publicApp").classList.add("hidden");
  $("#authScreen").classList.add("hidden");
  $("#appScreen").classList.remove("hidden");
  render();
}

function showView(id) {
  $$(".app-view").forEach(v => v.classList.remove("active"));
  const target = $("#" + id);
  if (target) target.classList.add("active");
  $$(".side-item").forEach(v => v.classList.toggle("active", v.dataset.view === id));
}
window.showView = showView; // Expose for inline handlers if any

// Auth Logic
$("#openLogin").onclick = () => goAuth("login");
$("#openRegister").onclick = () => goAuth("register");
$("#heroStart").onclick = () => goAuth("register");
$("#backToLanding").onclick = goLanding;
$$(".auth-switch button").forEach(b => b.onclick = () => goAuth(b.dataset.authMode));

$("#authForm").onsubmit = async e => {
  e.preventDefault();
  const email = $("#authEmail").value;
  const pass = $("#authPass").value;
  const btn = $("#authSubmit");
  btn.disabled = true;
  btn.textContent = "Cargando...";

  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, pass);
      toast("Sesión iniciada");
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // 15 days free trial setup
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 15);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        createdAt: new Date().toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        profile: {}
      });
      toast("Cuenta creada. ¡Tienes 15 días gratis!");
    }
  } catch (error) {
    console.error(error);
    toast("Error: Verifica tus datos o la configuración de Firebase.");
  } finally {
    btn.disabled = false;
    btn.textContent = mode === "login" ? "Entrar" : "Crear mi cuenta";
  }
};

$("#logout").onclick = () => signOut(auth);

// Firebase Auth Observer
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserData();
    goApp();
  } else {
    currentUser = null;
    state = { profile: {}, progress: [], plan: null };
    goLanding();
  }
});

async function loadUserData() {
  if (!currentUser) return;
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      state.profile = data.profile || {};
      state.plan = data.plan || null;
      
      // Trial Check
      if (data.trialEndsAt) {
        const trialEnd = new Date(data.trialEndsAt);
        const now = new Date();
        const diffDays = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        const banner = $("#trialBanner");
        if (diffDays > 0) {
          banner.style.display = "block";
          $("#trialDays").textContent = diffDays;
        } else {
          banner.style.display = "block";
          banner.style.background = "#ff3b30";
          banner.innerHTML = "Tu prueba gratuita ha expirado. Contacta a soporte para continuar.";
        }
      }
    }
    
    // Load Progress
    const q = query(collection(db, "users", currentUser.uid, "progress"), orderBy("date", "asc"));
    const snap = await getDocs(q);
    state.progress = snap.docs.map(d => d.data());
  } catch(e) {
    console.error("Error loading data:", e);
    toast("Error al cargar los datos.");
  }
}

// Profile Save
$("#profileForm").onsubmit = async e => {
  e.preventDefault();
  if(!currentUser) return;
  const btn = $("#saveProfileBtn");
  btn.disabled = true;
  btn.textContent = "Guardando...";
  
  const fd = new FormData(e.target);
  const p = Object.fromEntries(fd.entries());
  for(const key of ["age","weight","height","days","minutes","meals"]) p[key] = Number(p[key]) || null;
  for(const key of ["focus","equipment","ingredients","avoid"]) p[key] = p[key] ? p[key].split(",").map(x=>x.trim()).filter(Boolean) : [];
  
  state.profile = p;
  
  try {
    await updateDoc(doc(db, "users", currentUser.uid), { profile: state.profile });
    toast("Perfil guardado en la nube");
    render();
  } catch(err) {
    console.error(err);
    toast("Error al guardar el perfil.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar Perfil";
  }
};

// AI Plan Generation
$("#generatePlanBtn").onclick = async () => {
  if (!state.profile.weight || !state.profile.goal) {
    toast("Completa tu perfil (peso, objetivo) primero.");
    showView("profileView");
    return;
  }
  
  const btn = $("#generatePlanBtn");
  btn.disabled = true;
  btn.textContent = "Generando con IA...";
  toast("Gemini Pro está diseñando tu plan...");

  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: state.profile, history: state.progress.slice(-10) })
    });
    
    if (!response.ok) throw new Error("Error en el servidor");
    
    const data = await response.json();
    if(data.error) throw new Error(data.error);
    
    state.plan = data.plan;
    await updateDoc(doc(db, "users", currentUser.uid), { plan: state.plan });
    
    toast("Plan hiper-personalizado generado ✦");
    render();
    showView("dashboard");
  } catch(err) {
    console.error(err);
    toast("Error al generar plan. ¿Añadiste la GEMINI_API_KEY en Vercel?");
  } finally {
    btn.disabled = false;
    btn.textContent = "✦ Generar plan con IA";
  }
};

// Progress Logic
$("#newProgress").onclick = () => $("#progressModal").classList.remove("hidden");
$("#progressClose").onclick = () => $("#progressModal").classList.add("hidden");

$("#progressForm").onsubmit = async e => {
  e.preventDefault();
  if(!currentUser) return;
  const btn = $("#saveProgressBtn");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  const fd = new FormData(e.target);
  const record = {
    type: "measurement",
    date: new Date().toISOString().slice(0,10),
    weight: Number(fd.get("weight")) || null,
    waist: Number(fd.get("waist")) || null
  };

  try {
    await addDoc(collection(db, "users", currentUser.uid, "progress"), record);
    state.progress.push(record);
    if(record.weight) {
      state.profile.weight = record.weight;
      await updateDoc(doc(db, "users", currentUser.uid), { profile: state.profile });
    }
    toast("Progreso guardado ✓");
    render();
    $("#progressModal").classList.add("hidden");
    e.target.reset();
  } catch(err) {
    console.error(err);
    toast("Error al guardar progreso.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar en la nube";
  }
};

// Rendering
function render() {
  const p = state.profile || {};
  $("#dashboardGreeting").textContent = `Hola, ${p.name || 'Atleta'}.`;
  $("#dashboardSub").textContent = p.goal ? `${p.goal} · ${p.days || 4} días/sem` : "Completa tu perfil para comenzar.";
  
  const stats = [
    ["PESO", p.weight ? `${p.weight} kg` : "—"],
    ["OBJETIVO", p.goal || "Pendiente"],
    ["PLAN", state.plan ? "IA ACTIVA" : "PENDIENTE"]
  ];
  $("#dashboardStats").innerHTML = stats.map(x => `<div class="stat-card"><small>${esc(x[0])}</small><strong>${esc(x[1])}</strong></div>`).join("");
  
  $("#planTitle").textContent = state.plan ? "Plan IA Activo" : "Diseñado alrededor de tu vida.";
  $("#planSummary").textContent = state.plan?.summary || "La Inteligencia artificial combinará tu objetivo, nivel y disponibilidad.";
  
  $("#todayDate").textContent = new Intl.DateTimeFormat("es-ES", {weekday:"short", day:"numeric", month:"short"}).format(new Date());
  
  renderToday();
  renderTraining();
  renderNutrition();
  renderProgress();
  renderProfile();
}

function renderToday() {
  const days = state.plan?.weeklyTraining || [];
  if (!days.length) {
    $("#todayWorkout").innerHTML = `<div style="color:var(--muted); font-size:14px;">Genera tu plan con IA para ver tu entrenamiento.</div>`;
    return;
  }
  const day = days[0];
  $("#todayWorkout").innerHTML = `<p style="font-weight:600;">${esc(day.day)} · ${esc(day.focus)}</p>
     ${(day.exercises||[]).slice(0,3).map(x => `<div style="padding:8px 0; border-bottom:1px solid var(--line); font-size:14px;">• ${esc(x.name)} <span style="float:right; color:var(--muted)">${esc(x.sets)}×${esc(x.reps)}</span></div>`).join("")}
     <button class="btn btn-ghost" style="margin-top:10px; width:100%; text-align:left; padding:8px 0;" onclick="showView('training')">Ver rutina completa →</button>`;
}

function renderTraining() {
  const days = state.plan?.weeklyTraining || [];
  if (!days.length) {
    $("#trainingContent").innerHTML = `<div class="dash-card">Genera un plan con IA primero.</div>`;
    return;
  }
  $("#trainingContent").innerHTML = days.map(d => `
    <div class="dash-card" style="margin-bottom:16px;">
      <h3>${esc(d.day)} · ${esc(d.focus)}</h3>
      <p style="color:var(--muted); font-size:13px;"><b>Calentamiento:</b> ${esc((d.warmup||[]).join(" · "))}</p>
      ${(d.exercises||[]).map(e => `
        <div style="padding:16px 0; border-bottom:1px solid var(--line);">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <b>${esc(e.name)}</b>
            <span style="color:var(--lime); font-size:12px; font-weight:700;">${esc(e.sets)}×${esc(e.reps)}</span>
          </div>
          <div style="font-size:13px; color:var(--muted);">
            Descanso: ${esc(e.rest)} | RIR: ${esc(e.rir)}<br>
            <i>${esc(e.cues||"")}</i>
          </div>
        </div>
      `).join("")}
    </div>
  `).join("");
}

function renderNutrition() {
  const n = state.plan?.nutrition;
  if (!n) {
    $("#nutritionContent").innerHTML = `<div class="dash-card">Genera un plan con IA primero.</div>`;
    return;
  }
  const menu = (n.menu||[]).map(day => `
    <div class="dash-card" style="margin-bottom:16px;">
      <h3>${esc(day.day)}</h3>
      ${(day.meals||[]).map(m => `
        <div style="padding:12px 0; border-bottom:1px solid var(--line);">
          <b style="display:block; margin-bottom:4px;">${esc(m.name)}</b>
          <div style="font-size:13px; color:var(--muted); margin-bottom:4px;">${esc((m.ingredients||[]).join(", "))}</div>
          <div style="font-size:12px;">${esc(m.portion||"")} · ${esc(m.nutrition?.calories||"")} · ${esc(m.nutrition?.protein||"")}</div>
        </div>
      `).join("")}
    </div>
  `).join("");
  
  $("#nutritionContent").innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
      <div class="metric-card"><small>KCAL</small><strong>${esc(n.calorieRange)}</strong></div>
      <div class="metric-card"><small>PROTEÍNA</small><strong>${esc(n.proteinRange)}</strong></div>
      <div class="metric-card"><small>CARBOS</small><strong>${esc(n.carbRange)}</strong></div>
    </div>
    ${menu}
  `;
}

function renderProgress() {
  const measurements = state.progress.filter(x => x.type === "measurement");
  const last = measurements.at(-1);
  $("#progressContent").innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
      <div class="metric-card"><small>PESO ACTUAL</small><strong>${esc(last?.weight || state.profile.weight || "—")}${last?.weight?" kg":""}</strong></div>
      <div class="metric-card"><small>REGISTROS</small><strong>${measurements.length}</strong></div>
    </div>
    <div class="dash-card">
      <h3 style="margin-bottom:16px;">Historial</h3>
      ${measurements.length ? measurements.slice().reverse().map(x => `
        <div class="history-row">
          <b>${esc(x.date)}</b>
          <span>${esc(x.weight||"—")} kg</span>
          <span>${esc(x.waist||"—")} cm</span>
        </div>
      `).join("") : "<p style='color:var(--muted); font-size:14px;'>Todavía no hay mediciones guardadas en la nube.</p>"}
    </div>
  `;
}

function renderProfile() {
  const f = $("#profileForm");
  const p = state.profile || {};
  for(const [k, val] of Object.entries(p)) {
    if(f.elements[k]) f.elements[k].value = Array.isArray(val) ? val.join(", ") : val ?? "";
  }
}

$$(".side-item").forEach(b => b.onclick = () => {
  if(b.dataset.view) showView(b.dataset.view);
});