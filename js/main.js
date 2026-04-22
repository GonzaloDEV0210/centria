// CENTRIA — JavaScript puro
// Funcionalidades: menú hamburguesa, slider de testimonios, animaciones on-scroll,
// validación básica del formulario, año dinámico en footer, link activo del menú.

(function () {
  "use strict";

  /* -------- Año dinámico -------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Marcar enlace activo -------- */
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("data-nav");
    if (target === path) link.classList.add("active");
  });

  /* -------- Menú hamburguesa -------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.querySelector(".icon-open")?.classList.toggle("hidden", isOpen);
      burger.querySelector(".icon-close")?.classList.toggle("hidden", !isOpen);
    });
    // cerrar al hacer click en un link
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.querySelector(".icon-open")?.classList.remove("hidden");
        burger.querySelector(".icon-close")?.classList.add("hidden");
      })
    );
  }

  /* -------- Reveal on scroll -------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* -------- Slider de testimonios -------- */
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector(".slider-track");
    const slides = slider.querySelectorAll(".slider-slide");
    const dotsWrap = slider.querySelector(".slider-dots");
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    let index = 0;
    let timer = null;

    // Crear dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Ir al testimonio ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = dotsWrap.querySelectorAll(".slider-dot");

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
      restart();
    }

    function start() {
      timer = setInterval(() => goTo(index + 1), 6000);
    }
    function restart() {
      clearInterval(timer);
      start();
    }

    prev?.addEventListener("click", () => goTo(index - 1));
    next?.addEventListener("click", () => goTo(index + 1));

    // Pausar al pasar el mouse
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", start);

    // Soporte táctil básico
    let startX = 0;
    slider.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    slider.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) goTo(index + (diff < 0 ? 1 : -1));
    });

    update();
    start();
  }

  /* -------- Validación de formulario contacto -------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");

    const nameInput = form.name;
    const emailInput = form.email;
    const whatsappInput = form.whatsapp;
    const messageInput = form.message;

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const whatsappError = document.getElementById("whatsapp-error");
    const messageError = document.getElementById("message-error");

    const hideError = (el) => { if (el) el.classList.add("hidden"); };
    const showError = (el) => { if (el) el.classList.remove("hidden"); };

    if (nameInput) nameInput.addEventListener("input", () => hideError(nameError));
    if (emailInput) emailInput.addEventListener("input", () => hideError(emailError));
    if (whatsappInput) {
      whatsappInput.addEventListener("input", function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        hideError(whatsappError);
      });
    }
    if (messageInput) messageInput.addEventListener("input", () => hideError(messageError));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      let isValid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const whatsapp = whatsappInput ? whatsappInput.value.trim() : "";
      const message = messageInput.value.trim();

      if (status) status.textContent = "";

      if (!name) {
        showError(nameError);
        isValid = false;
      } else {
        hideError(nameError);
      }
      
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRe.test(email)) {
        showError(emailError);
        isValid = false;
      } else {
        hideError(emailError);
      }
      
      if (!whatsapp || whatsapp.length !== 9) {
        showError(whatsappError);
        isValid = false;
      } else {
        hideError(whatsappError);
      }
      
      if (!message) {
        showError(messageError);
        isValid = false;
      } else {
        hideError(messageError);
      }

      if (!isValid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Enviando...';
      submitBtn.disabled = true;

      const formData = new FormData(form);

      fetch('enviar.php', {
        method: 'POST',
        body: formData
      })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error en el servidor");
        return data;
      })
      .then(data => {
        if (data.status === 'success') {
          showToast("¡Mensaje enviado!", "Te contactaremos en menos de 24 horas.");
          form.reset();
        } else {
          alert("Aviso: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Ocurrió un error al intentar enviar el mensaje. Revisa tu conexión o inténtalo más tarde.");
      })
      .finally(() => {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      });
    });

    function showToast(title, message) {
      let toast = document.getElementById("success-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "success-toast";
        toast.className = "toast-notification";
        toast.innerHTML = `
          <svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="toast-content">
            <span class="toast-title"></span>
            <span class="toast-message"></span>
          </div>
        `;
        document.body.appendChild(toast);
      }
      
      toast.querySelector(".toast-title").textContent = title;
      toast.querySelector(".toast-message").textContent = message;
      
      toast.classList.remove("show");
      void toast.offsetWidth; // Force reflow
      toast.classList.add("show");
      
      setTimeout(() => {
        toast.classList.remove("show");
      }, 4500);
    }
  }
})();

/* ---------- Botón flotante de WhatsApp ---------- */
(function initWhatsApp() {
  const phone = "51999999999"; // <-- reemplazar por el número real (formato internacional sin +)
  const message = encodeURIComponent("Hola, me gustaría agendar una cita en CENTRIA.");
  const a = document.createElement("a");
  a.href = `https://wa.me/${phone}?text=${message}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.className = "wa-float";
  a.setAttribute("aria-label", "Escríbenos por WhatsApp");
  a.innerHTML = `
    <span class="wa-tooltip">¿Necesitas ayuda? Escríbenos</span>
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.38-1.67a11.83 11.83 0 0 0 5.65 1.44h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.14-3.46-8.45ZM12.04 21.5h-.01a9.66 9.66 0 0 1-4.93-1.35l-.35-.21-3.78.99 1.01-3.69-.23-.38a9.66 9.66 0 0 1-1.48-5.12c0-5.34 4.34-9.68 9.68-9.68 2.58 0 5.01 1.01 6.84 2.84a9.6 9.6 0 0 1 2.83 6.84c0 5.34-4.34 9.76-9.58 9.76Zm5.31-7.26c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.19.29-.76.95-.93 1.14-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.45-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.6-.91-2.19-.24-.57-.49-.5-.66-.51l-.56-.01c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.81 1.19 3 .15.19 2.06 3.14 4.99 4.41.7.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.27.17-1.38-.07-.12-.27-.19-.56-.34Z"/>
    </svg>`;
  document.body.appendChild(a);
})();

/* ---------- Botón flotante de FAQ con chat ---------- */
(function initFAQ() {
  const faqs = [
    {
      q: "¿Dónde están ubicados?",
      a: "Estamos en Av. Principal 123, Lima. La atención es 100% presencial en nuestro centro."
    },
    {
      q: "¿Cuál es el horario de atención?",
      a: "Atendemos de Lunes a Viernes de 9:00 a 20:00 y Sábados de 9:00 a 14:00."
    },
    {
      q: "¿Cómo agendo una cita?",
      a: "Puedes agendar escribiéndonos por WhatsApp, llamando al centro o llenando el formulario en la página de Contacto."
    },
    {
      q: "¿Ofrecen terapia online?",
      a: "No. Nuestra atención es 100% presencial para garantizar la calidez y calidad de cada sesión."
    },
    {
      q: "¿Qué especialidades atienden?",
      a: "Terapia psicológica, terapia de lenguaje, terapia ocupacional, terapia infantil, de pareja y familiar."
    },
    {
      q: "¿Cuánto dura una sesión?",
      a: "Las sesiones duran aproximadamente 50 minutos, dependiendo del tipo de terapia."
    },
    {
      q: "¿Atienden a niños?",
      a: "Sí, contamos con especialistas en terapia infantil y de lenguaje para niñas y niños."
    }
  ];

  // Botón flotante
  const btn = document.createElement("button");
  btn.className = "faq-float";
  btn.setAttribute("aria-label", "Preguntas frecuentes");
  btn.type = "button";
  btn.innerHTML = `
    <span class="faq-tooltip">Preguntas frecuentes</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="12" y1="11" x2="12" y2="11"/>
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7"/>
    </svg>`;
  document.body.appendChild(btn);

  // Panel del chat
  const panel = document.createElement("div");
  panel.className = "faq-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Chat de preguntas frecuentes");
  panel.innerHTML = `
    <div class="faq-header">
      <div>
        <h4>Preguntas frecuentes</h4>
        <p>Estamos aquí para ayudarte</p>
      </div>
      <button class="faq-close" aria-label="Cerrar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="faq-body" id="faq-body">
      <div class="faq-msg">¡Hola! 👋 Soy el asistente de CENTRIA. Elige una pregunta para ver la respuesta:</div>
    </div>
    <div class="faq-questions" id="faq-questions"></div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector("#faq-body");
  const questionsWrap = panel.querySelector("#faq-questions");
  const closeBtn = panel.querySelector(".faq-close");

  // Render preguntas
  faqs.forEach((item) => {
    const qBtn = document.createElement("button");
    qBtn.type = "button";
    qBtn.className = "faq-q-btn";
    qBtn.textContent = item.q;
    qBtn.addEventListener("click", () => {
      const userMsg = document.createElement("div");
      userMsg.className = "faq-msg user";
      userMsg.textContent = item.q;
      body.appendChild(userMsg);

      setTimeout(() => {
        const botMsg = document.createElement("div");
        botMsg.className = "faq-msg";
        botMsg.textContent = item.a;
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 400);

      body.scrollTop = body.scrollHeight;
    });
    questionsWrap.appendChild(qBtn);
  });

  btn.addEventListener("click", () => panel.classList.toggle("open"));
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));
})();
