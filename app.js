const data = window.CV_DATA;
const browserLang = (navigator.language || "es").toLowerCase();
let lang = localStorage.getItem("cv-lang") || (browserLang.startsWith("en") ? "en" : "es");

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const yearFrom = (value) => {
  const match = String(value || "").match(/(19|20)\d{2}/);
  return match ? match[0] : "0";
};
const numberLabel = (value) => new Intl.NumberFormat(lang === "es" ? "es-EC" : "en-US").format(value);
const isPlaceholderUrl = (href) => !href || String(href).startsWith("#pendiente");
const publicStatus = (status) => {
  const text = String(status || "");
  if (/pendiente|consolidar|contraste/i.test(text)) {
    return lang === "es"
      ? "Información documentada en CV maestro; respaldo disponible en el repositorio cuando corresponde."
      : "Information documented in the master CV; supporting evidence is available in the repository where applicable.";
  }
  return text;
};
const evidenceButton = (href, label, fallbackLabel) => {
  const target = isPlaceholderUrl(href) ? "#evidencias" : href;
  const text = isPlaceholderUrl(href) ? fallbackLabel : label;
  const targetAttrs = isPlaceholderUrl(href) ? "" : ' target="_blank" rel="noopener"';
  return `<a class="btn" href="${target}"${targetAttrs}>${text}</a>`;
};
const documentRequestLink = (documentName) => {
  const subject = encodeURIComponent(`Solicitud de documento: ${documentName}`);
  const body = encodeURIComponent(`Estimado Mgs. Schubert Lombeida,\n\nSolicito, por favor, la remisión del siguiente documento de respaldo: ${documentName}.\n\nGracias.`);
  return `mailto:${data.person.email}?subject=${subject}&body=${body}`;
};

function setLanguage() {
  document.documentElement.lang = lang;
  $$("[data-label-es]").forEach((node) => {
    node.textContent = node.dataset[`label${lang === "es" ? "Es" : "En"}`] || node.dataset.labelEs;
  });
  $$("[data-i18n]").forEach((node) => {
    node.textContent = data.i18n[lang][node.dataset.i18n];
  });
  const search = $("#certSearch");
  if (search) search.placeholder = lang === "es" ? "Buscar curso, institución o área" : "Search course, institution or area";
  $$(".language-switch button").forEach((button) => button.classList.toggle("active", button.dataset.lang === lang));
}

function renderNavigation() {
  const ids = ["inicio","perfil","documentos-personales","dashboard","formacion","experiencia","certificaciones","proyectos","evidencias","contacto"];
  $(".main-nav").innerHTML = data.i18n[lang].nav.map((label, index) => `<a href="#${ids[index]}">${label}</a>`).join("");
}

function renderHero() {
  $("#pdfLink").href = lang === "en" && data.person.pdfEn ? data.person.pdfEn : data.person.pdf;
  if (data.person.photo) {
    const portrait = $("#portrait");
    portrait.classList.add("has-photo");
    portrait.style.backgroundImage = `url('${data.person.photo}')`;
  }
}

function renderHeroMetrics() {
  const linkedEvidence = data.evidence.filter((item) => /^https:\/\/drive\.google\.com/.test(item.url || "")).length;
  const latestYear = Math.max(...data.evidence.map((item) => Number(yearFrom(item.year))).filter(Boolean));
  const metrics = [
    { value: "25+", es: "años de trayectoria", en: "years of experience" },
    { value: "10", es: "ejes profesionales", en: "professional pillars" },
    { value: numberLabel(linkedEvidence), es: "respaldos en Drive", en: "Drive evidence files" },
    { value: String(latestYear), es: "actualización documental", en: "latest evidence update" }
  ];
  $("#heroMetrics").innerHTML = metrics.map((item) => `
    <div class="metric">
      <strong>${item.value}</strong>
      <span>${lang === "es" ? item.es : item.en}</span>
    </div>
  `).join("");
}

function renderExperience() {
  const tags = [...new Set(data.experience.flatMap((item) => item.tags))].sort();
  $("#experienceFilter").innerHTML = `<option value="all">${lang === "es" ? "Todas las competencias" : "All skills"}</option>` + tags.map((tag) => `<option>${tag}</option>`).join("");
  drawExperience();
  $("#experienceFilter").addEventListener("change", drawExperience);
}

function drawExperience() {
  const selected = $("#experienceFilter").value || "all";
  const items = data.experience
    .filter((item) => selected === "all" || item.tags.includes(selected))
    .sort((a, b) => b.start - a.start);
  $("#timeline").innerHTML = items.map((item) => `
    <article class="timeline-card ${item.featured ? "featured" : ""}">
      <p class="meta">${item.period} | ${item.place} | ${item.type}</p>
      <h3>${item.role}</h3>
      <p><strong>${item.institution}</strong></p>
      <p>${item.functions}</p>
      <p class="status">${publicStatus(item.status)}</p>
      <div class="tags">${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      ${evidenceButton(item.evidence, lang === "es" ? "Ver respaldo documental" : "View evidence", lang === "es" ? "Ver repositorio documental" : "View evidence repository")}
    </article>
  `).join("");
}

function renderEducation() {
  const items = [...data.education].sort((a, b) => (b.year || 0) - (a.year || 0));
  $("#educationList").innerHTML = items.map((item) => `
    <article class="card">
      <p class="meta">${item.level}${item.year ? ` | ${item.year}` : ""}</p>
      <h3>${item.title}</h3>
      <p><strong>${item.institution}</strong></p>
      <p>${item.detail}</p>
      <p class="status">${publicStatus(item.status)}</p>
      ${evidenceButton(item.evidence, lang === "es" ? "Ver respaldo" : "View evidence", lang === "es" ? "Ver repositorio documental" : "View evidence repository")}
    </article>
  `).join("");
}

function categoryGroup(category) {
  const c = normalize(category);
  if (c.includes("gestion publica") || c.includes("derecho") || c.includes("contratacion") || c.includes("transparencia") || c.includes("etica")) return "Gestión pública";
  if (c.includes("planificacion") || c.includes("proyecto") || c.includes("procesos") || c.includes("inversion")) return "Planificación";
  if (c.includes("liderazgo") || c.includes("talento")) return "Liderazgo";
  if (c.includes("telecom") || c.includes("radiodifusion") || c.includes("espectro") || c.includes("tic") || c.includes("4g")) return "Telecomunicaciones";
  if (c.includes("linux") || c.includes("sistema") || c.includes("redes") || c.includes("base") || c.includes("ciber")) return "Tecnología";
  if (c.includes("sig") || c.includes("arc") || c.includes("gps") || c.includes("cartografia")) return "Sistemas de información geográfica";
  if (c.includes("ambiente") || c.includes("conservacion") || c.includes("clima") || c.includes("hidricos") || c.includes("drones")) return "Ambiente";
  if (c.includes("galapagos") || c.includes("residencia")) return "Régimen Especial de Galápagos";
  if (c.includes("ia") || c.includes("chatgpt")) return "Inteligencia artificial";
  if (c.includes("maritim") || c.includes("radar") || c.includes("ais") || c.includes("navegacion")) return "Gestión marítima";
  if (c.includes("turismo") || c.includes("hotel")) return "Turismo y sostenibilidad";
  return "Otros";
}

function renderCertControls() {
  const years = [...new Set(data.certifications.map((item) => yearFrom(item.date)))].sort((a, b) => Number(b) - Number(a));
  const categories = [...new Set(data.certifications.map((item) => categoryGroup(item.category)))].sort();
  $("#certYear").innerHTML = `<option value="all">${lang === "es" ? "Todos los años" : "All years"}</option>` + years.filter((year) => year !== "0").map((year) => `<option>${year}</option>`).join("");
  $("#certCategory").innerHTML = `<option value="all">${lang === "es" ? "Todas las áreas" : "All areas"}</option>` + categories.map((cat) => `<option>${cat}</option>`).join("");
  $("#certSearch").oninput = drawCertifications;
  $("#certYear").onchange = drawCertifications;
  $("#certCategory").onchange = drawCertifications;
  drawCertifications();
}

function drawCertifications() {
  const query = normalize($("#certSearch").value);
  const year = $("#certYear").value || "all";
  const category = $("#certCategory").value || "all";
  const items = data.certifications.filter((item) => {
    const haystack = normalize(`${item.name} ${item.institution} ${item.category}`);
    return (!query || haystack.includes(query)) &&
      (year === "all" || yearFrom(item.date) === year) &&
      (category === "all" || categoryGroup(item.category) === category);
  }).sort((a, b) => Number(yearFrom(b.date)) - Number(yearFrom(a.date)));
  $("#certList").innerHTML = items.map((item) => `
    <article class="cert-item">
      <div class="cert-summary">
        <strong>${item.date}</strong>
        <div>
          <p class="cert-title">${item.name}</p>
          <p class="meta">${item.institution}${item.duration ? ` | ${item.duration}` : ""}</p>
          <div class="tags"><span class="tag">${categoryGroup(item.category)}</span><span class="tag">${item.recommendedUse}</span></div>
        </div>
        ${evidenceButton(item.evidence, lang === "es" ? "Respaldo" : "Evidence", lang === "es" ? "Repositorio" : "Repository")}
      </div>
    </article>
  `).join("") || `<p class="notice">${lang === "es" ? "No hay resultados para el filtro aplicado." : "No results for the selected filter."}</p>`;
}

function renderProjects() {
  $("#projectList").innerHTML = data.projects.map((item) => `
    <article class="card">
      <h3>${lang === "es" ? item.title : item.titleEn}</h3>
      <p>${lang === "es" ? item.body : item.bodyEn}</p>
      <div class="tags">${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    </article>
  `).join("");
}

function renderDashboard() {
  const strategic = ["direction", "planning", "tech", "galapagos"];
  const topItems = data.indicators.filter((item) => strategic.includes(item.id));
  const average = Math.round(topItems.reduce((sum, item) => sum + Number(item.value || 0), 0) / topItems.length);
  const linkedEvidence = data.evidence.filter((item) => /^https:\/\/drive\.google\.com/.test(item.url || "")).length;
  $("#dashboardSummary").innerHTML = `
    <article class="dashboard-hero-card">
      <span>${lang === "es" ? "Lectura ejecutiva" : "Executive reading"}</span>
      <strong>${average}/100</strong>
      <p>${lang === "es"
        ? "Promedio referencial de los ejes de dirección, planificación, tecnología y Galápagos."
        : "Reference average for leadership, planning, technology and Galapagos pillars."}</p>
    </article>
    <article class="dashboard-stat">
      <strong>${numberLabel(data.certifications.length)}</strong>
      <span>${lang === "es" ? "certificaciones y cursos" : "certifications and courses"}</span>
    </article>
    <article class="dashboard-stat">
      <strong>${numberLabel(linkedEvidence)}</strong>
      <span>${lang === "es" ? "respaldos conectados a Google Drive" : "Google Drive evidence links"}</span>
    </article>
    <article class="dashboard-stat">
      <strong>${numberLabel(data.experience.filter((item) => item.featured).length)}</strong>
      <span>${lang === "es" ? "cargos directivos destacados" : "featured leadership roles"}</span>
    </article>
  `;
  $("#indicatorList").innerHTML = data.indicators.map((item) => `
    <article class="indicator-card">
      <div class="ring" style="--score:${item.value}"><span>${item.value}</span></div>
      <h3>${lang === "es" ? item.es : item.en}</h3>
      <p>${lang === "es" ? item.note : item.noteEn}</p>
      <div class="score-bar" aria-hidden="true"><span style="width:${item.value}%"></span></div>
    </article>
  `).join("");
}

function renderEvidence() {
  const categories = data.evidenceCategories;
  const labelFor = (cat) => {
    const item = data.evidence.find((entry) => entry.type === cat);
    return lang === "es" ? cat : (item?.typeEn || cat);
  };
  const years = [...new Set(data.evidence.map((item) => yearFrom(item.year)).filter((year) => year !== "0"))]
    .sort((a, b) => Number(b) - Number(a));
  $("#evidenceFilter").innerHTML = `<option value="all">${lang === "es" ? "Todas las categorías" : "All categories"}</option>` + categories.map((cat) => `<option value="${cat}">${labelFor(cat)}</option>`).join("");
  $("#evidenceYear").innerHTML = `<option value="all">${lang === "es" ? "Todos los años" : "All years"}</option>` + years.map((year) => `<option>${year}</option>`).join("");
  $("#evidenceSearch").placeholder = lang === "es" ? "Buscar documento, institución o tema" : "Search document, institution or topic";
  $("#evidenceFilter").onchange = drawEvidence;
  $("#evidenceYear").onchange = drawEvidence;
  $("#evidenceSearch").oninput = drawEvidence;
  drawEvidence();
}

function drawEvidence() {
  const selected = $("#evidenceFilter").value || "all";
  const selectedYear = $("#evidenceYear").value || "all";
  const query = normalize($("#evidenceSearch").value);
  const items = data.evidence
    .filter((item) => selected === "all" || item.type === selected)
    .filter((item) => selectedYear === "all" || yearFrom(item.year) === selectedYear)
    .filter((item) => !query || normalize(`${item.name} ${item.institution} ${item.type} ${item.year}`).includes(query))
    .sort((a, b) => Number(yearFrom(b.year)) - Number(yearFrom(a.year)) || Number(b.month || 0) - Number(a.month || 0));
  $("#evidenceList").innerHTML = items.map((item) => `
    <article class="evidence-item">
      <div>
        <p class="meta">${item.year} | ${lang === "es" ? item.type : item.typeEn || item.type}</p>
        <h3>${lang === "es" ? item.name : item.nameEn || item.name}</h3>
        <p>${item.institution}</p>
        <p class="status">${publicStatus(item.status)}</p>
      </div>
      <div class="evidence-actions">
        ${evidenceButton(item.url, lang === "es" ? "Ver respaldo" : "View evidence", lang === "es" ? "Repositorio" : "Repository")}
        ${!isPlaceholderUrl(item.downloadUrl || item.url) ? `<a class="btn ghost" href="${item.downloadUrl || item.url}" target="_blank" rel="noopener">${lang === "es" ? "Descargar" : "Download"}</a>` : ""}
      </div>
    </article>
  `).join("") || `<p class="notice">${lang === "es" ? "No hay respaldos para el filtro aplicado." : "No evidence records match the selected filter."}</p>`;
}

function renderIdentityDocuments() {
  $("#identityDocsList").innerHTML = data.identityDocuments.map((item) => `
    <article class="evidence-item">
      <div>
        <h3>${lang === "es" ? item.name : item.nameEn}</h3>
        <p>${item.institution}</p>
        <p class="status">${publicStatus(item.status)}</p>
      </div>
      <div class="evidence-actions">
        <a class="btn" href="${documentRequestLink(lang === "es" ? item.name : item.nameEn)}">${lang === "es" ? "Solicitar documento por correo" : "Request document by email"}</a>
      </div>
    </article>
  `).join("");
}

function renderContact() {
  const person = data.person;
  const optionalLink = (href, label) => href ? `<a href="${href}" target="_blank" rel="noopener">${label}</a>` : "";
  $("#contactCard").innerHTML = `
    <a href="mailto:${person.email}">${lang === "es" ? "Correo" : "Email"}: ${person.email}</a>
    <a href="tel:${person.phone.replace(/\s/g, "")}">${lang === "es" ? "Teléfono celular" : "Mobile phone"}: ${person.phone}</a>
    <span>${lang === "es" ? "Dirección" : "Address"}: ${person.address || person.location}</span>
    <span>${lang === "es" ? "Ubicación" : "Location"}: ${person.location}</span>
    ${optionalLink(person.linkedin, "LinkedIn")}
    <a href="${lang === "en" && person.pdfEn ? person.pdfEn : person.pdf}" target="_blank" rel="noopener">${lang === "es" ? "Descargar CV general" : "Download general CV"}</a>
    ${optionalLink(person.repository && !person.repository.startsWith("#") ? person.repository : "", lang === "es" ? "Repositorio documental" : "Document repository")}
  `;
}

function initMenu() {
  $(".menu-toggle").addEventListener("click", () => {
    const nav = $(".main-nav");
    const open = nav.classList.toggle("open");
    $(".menu-toggle").setAttribute("aria-expanded", String(open));
  });
  $(".main-nav").addEventListener("click", () => $(".main-nav").classList.remove("open"));
}

function initLanguageSwitch() {
  $$(".language-switch button").forEach((button) => {
    button.addEventListener("click", () => {
      lang = button.dataset.lang;
      localStorage.setItem("cv-lang", lang);
      setLanguage();
      renderNavigation();
      renderHero();
      renderHeroMetrics();
      renderExperience();
      renderEducation();
      renderCertControls();
      renderProjects();
      renderDashboard();
      renderEvidence();
      renderIdentityDocuments();
      renderContact();
    });
  });
}

function init() {
  setLanguage();
  renderNavigation();
  renderHero();
  renderHeroMetrics();
  renderExperience();
  renderEducation();
  renderCertControls();
  renderProjects();
  renderDashboard();
  renderEvidence();
  renderIdentityDocuments();
  renderContact();
  initMenu();
  initLanguageSwitch();
}

init();
