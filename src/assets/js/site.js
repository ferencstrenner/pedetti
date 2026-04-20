(function(){
    var slides = Array.from(document.querySelectorAll('.hero__slide'));
    var dots = Array.from(document.querySelectorAll('.hero__dots .dot'));
    var current = 0, interval;

    function normalizeIndex(n){
        if(!slides.length) return 0;
        return (n + slides.length) % slides.length;
    }

    function ensureSlideLoaded(index){
        var i = normalizeIndex(index);
        var slide = slides[i];
        if(!slide) return;
        var pendingSrc = slide.getAttribute('data-src');
        if(pendingSrc){
            slide.setAttribute('src', pendingSrc);
            slide.removeAttribute('data-src');
        }
    }

    function preloadSlide(index){
        var i = normalizeIndex(index);
        var slide = slides[i];
        if(!slide) return;
        var pendingSrc = slide.getAttribute('data-src');
        if(!pendingSrc) return;
        var img = new Image();
        img.src = pendingSrc;
    }

    function go(n){
        if(!slides.length) return;
        slides.forEach(function(s){ s.classList.remove('active'); });
        dots.forEach(function(d){ d.classList.remove('active'); });
        current = normalizeIndex(n);
        ensureSlideLoaded(current);
        preloadSlide(current + 1);
        slides[current] && slides[current].classList.add('active');
        dots[current] && dots[current].classList.add('active');
    }

    function next(){ go(current + 1); }
    function prev(){ go(current - 1); }
    function start(){ clearInterval(interval); interval = setInterval(next, 5000); }
    function stop(){ clearInterval(interval); }

    // Prev/Next
    document.querySelectorAll('.hero__prev, .hero__next').forEach(function(b){
        if(!b) return;
        b.addEventListener('click', function(){ stop(); if(b.classList.contains('hero__prev')) prev(); else next(); start(); });
    });

    // Dots
    dots.forEach(function(dot, i){ dot.addEventListener('click', function(){ stop(); go(i); start(); }); });

    // Hover pause
    var hero = document.querySelector('.hero');
    if(hero){ hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start); }

    // Lightbox
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightboxImage');
    var lbCaption = document.getElementById('lightboxCaption');

    slides.forEach(function(img, i){
        img.addEventListener('click', function(e){ e.preventDefault(); stop(); if(!lightbox || !lbImg) return; ensureSlideLoaded(i); document.body.classList.add('lightbox-open'); lightbox.classList.add('active'); lbImg.src = slides[i].src; if(lbCaption) lbCaption.textContent = img.dataset.caption || img.alt || ''; current = i; preloadSlide(i + 1); });
        try{ img.setAttribute('draggable','false'); }catch(e){}
        img.addEventListener('contextmenu', function(e){ e.preventDefault(); return false; });
    });

    var lbClose = document.querySelector('.lightbox__close');
    var lbPrev = document.querySelector('.lightbox__prev');
    var lbNext = document.querySelector('.lightbox__next');
    if(lbClose) lbClose.addEventListener('click', function(){ lightbox.classList.remove('active'); document.body.classList.remove('lightbox-open'); start(); });
    if(lightbox) lightbox.addEventListener('click', function(e){ if(e.target === lightbox){ lightbox.classList.remove('active'); document.body.classList.remove('lightbox-open'); start(); } });
    if(lbPrev) lbPrev.addEventListener('click', function(){ var i = normalizeIndex(current - 1); ensureSlideLoaded(i); document.getElementById('lightboxImage').src = slides[i].src; current = i; preloadSlide(i - 1); });
    if(lbNext) lbNext.addEventListener('click', function(){ var i = normalizeIndex(current + 1); ensureSlideLoaded(i); document.getElementById('lightboxImage').src = slides[i].src; current = i; preloadSlide(i + 1); });

    document.addEventListener('keydown', function(e){ if(lightbox && lightbox.classList.contains('active')){ if(e.key === 'Escape'){ lightbox.classList.remove('active'); document.body.classList.remove('lightbox-open'); start(); } else if(e.key === 'ArrowLeft'){ lbPrev && lbPrev.click(); } else if(e.key === 'ArrowRight'){ lbNext && lbNext.click(); } } });

    // Mobile menu and language dropdown behavior
    (function(){
        var btn = document.querySelector('.hamburger');
        var nav = document.getElementById('main-nav');
        if(!btn || !nav) return;
        document.addEventListener('click', function(e){
            if(nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)){
                nav.classList.remove('open');
                btn.setAttribute('aria-expanded','false');
            }
        });
        window.addEventListener('resize', function(){
            if(window.innerWidth > 768 && nav.classList.contains('open')){
                nav.classList.remove('open');
                btn.setAttribute('aria-expanded','false');
            }
        });
        var autoCloseTimer = null;
        var AUTO_CLOSE_MS = 5000;
        function startAutoClose() {
            clearTimeout(autoCloseTimer);
            autoCloseTimer = setTimeout(function(){
                if(nav.classList.contains('open')){
                    nav.classList.remove('open');
                    btn.setAttribute('aria-expanded','false');
                }
            }, AUTO_CLOSE_MS);
        }
        function stopAutoClose() { clearTimeout(autoCloseTimer); }

        btn.addEventListener('click', function(){
            if(nav.classList.contains('open')) {
                nav.classList.remove('open');
                btn.setAttribute('aria-expanded','false');
                stopAutoClose();
            } else {
                nav.classList.add('open');
                btn.setAttribute('aria-expanded','true');
                startAutoClose();
            }
        });

        ['pointerdown','pointerenter','focusin','keydown','touchstart'].forEach(function(evt){
            nav.addEventListener(evt, function(){ stopAutoClose(); startAutoClose(); }, {passive: true});
        });

        nav.addEventListener('click', function(e){
            var t = e.target;
            while(t && t !== nav){
                if(t.tagName === 'A'){
                    nav.classList.remove('open');
                    btn.setAttribute('aria-expanded','false');
                    stopAutoClose();
                    return;
                }
                t = t.parentElement;
            }
        });

        var langButtons = document.querySelectorAll('.lang-button');
        langButtons.forEach(function(b){
            b.addEventListener('click', function(e){
                var p = b.parentElement; if(!p) return; p.classList.toggle('open'); var expanded = p.classList.contains('open') ? 'true' : 'false'; b.setAttribute('aria-expanded', expanded);
            });
        });

    })();

    // Contact form submit via EmailJS
    (function(){
        var forms = document.querySelectorAll('.contact-emailjs-form');
        if(!forms.length) return;

        var messages = {
            hu: {
                sending: 'Kuldes folyamatban...',
                success: 'Koszonjuk! Uzenetedet sikeresen elkuldtuk.',
                error: 'Hiba tortent kuldes kozben. Kerjuk, probald ujra kesobb.',
                config: 'EmailJS nincs beallitva. Add meg a Service ID, Template ID es Public Key ertekeit.'
            },
            en: {
                sending: 'Sending...',
                success: 'Thank you! Your message has been sent successfully.',
                error: 'An error occurred while sending. Please try again later.',
                config: 'EmailJS is not configured. Please set Service ID, Template ID, and Public Key.'
            },
            de: {
                sending: 'Wird gesendet...',
                success: 'Danke! Ihre Nachricht wurde erfolgreich gesendet.',
                error: 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es spater erneut.',
                config: 'EmailJS ist nicht konfiguriert. Bitte Service ID, Template ID und Public Key eintragen.'
            }
        };

        function isPlaceholder(v){
            return !v || v.indexOf('YOUR_EMAILJS_') === 0;
        }

        forms.forEach(function(form){
            form.addEventListener('submit', function(e){
                e.preventDefault();

                var lang = form.getAttribute('data-lang') || 'hu';
                var text = messages[lang] || messages.hu;
                var status = form.querySelector('.form-status');
                var button = form.querySelector('button[type="submit"]');
                var serviceId = form.getAttribute('data-emailjs-service-id');
                var templateId = form.getAttribute('data-emailjs-template-id');
                var publicKey = form.getAttribute('data-emailjs-public-key');

                if(!window.emailjs){
                    if(status){ status.textContent = text.error; status.style.color = '#B22222'; }
                    return;
                }

                if(isPlaceholder(serviceId) || isPlaceholder(templateId) || isPlaceholder(publicKey)){
                    if(status){ status.textContent = text.config; status.style.color = '#B22222'; }
                    return;
                }

                if(status){ status.textContent = text.sending; status.style.color = '#3D2817'; }
                if(button){ button.disabled = true; button.style.opacity = '0.75'; }

                window.emailjs.sendForm(serviceId, templateId, form, { publicKey: publicKey })
                    .then(function(){
                        form.reset();
                        if(status){ status.textContent = text.success; status.style.color = '#228B22'; }
                    })
                    .catch(function(){
                        if(status){ status.textContent = text.error; status.style.color = '#B22222'; }
                    })
                    .finally(function(){
                        if(button){ button.disabled = false; button.style.opacity = '1'; }
                    });
            });
        });
    })();

    ensureSlideLoaded(0);
    preloadSlide(1);
    if(slides.length > 1){
        start();
    }
})();
