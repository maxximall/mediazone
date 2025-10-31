// Load carousel slides and initialize carousel functionality
(function(){
    const track = document.getElementById('carousel-track');
    const dotsNav = document.getElementById('carousel-dots');
    if(!track || !dotsNav) return;
    
    let slides = [];
    let dots = [];
    let index = 0;
    let autoTimer;
    let prevBtn, nextBtn, carousel;

    function createSlide(slideData, slideIndex) {
        const slide = document.createElement('div');
        slide.className = slideIndex === 0 ? 'slide is-active' : 'slide';
        
        const img = document.createElement('img');
        img.src = slideData.image;
        img.alt = `Production still ${slideIndex + 1}`;
        slide.appendChild(img);
        
        return slide;
    }

    function createDot(dotIndex) {
        const dot = document.createElement('button');
        dot.className = dotIndex === 0 ? 'dot is-active' : 'dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${dotIndex + 1}`);
        dot.setAttribute('aria-selected', dotIndex === 0 ? 'true' : 'false');
        return dot;
    }

    function setSlide(newIndex){
        if (slides.length === 0) return;
        index = (newIndex + slides.length) % slides.length;
        const offset = -index * 100;
        track.style.transform = 'translateX(' + offset + '%)';
        slides.forEach((s,i)=>s.classList.toggle('is-active', i===index));
        dots.forEach((d,i)=>{
            d.classList.toggle('is-active', i===index);
            d.setAttribute('aria-selected', i===index ? 'true' : 'false');
        });
    }

    function next(){ setSlide(index+1); }
    function prev(){ setSlide(index-1); }

    function start(){ autoTimer = setInterval(next, 5000); }
    function stop(){ clearInterval(autoTimer); }

    function initializeCarousel() {
        // Get carousel elements after slides are loaded
        prevBtn = document.querySelector('.carousel-btn.prev');
        nextBtn = document.querySelector('.carousel-btn.next');
        carousel = document.querySelector('.carousel');
        
        if (!prevBtn || !nextBtn || !carousel) return;

        // Add event listeners
        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);
        dots.forEach((dot,i)=> dot.addEventListener('click', ()=> setSlide(i)));
        
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
        window.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
        window.addEventListener('resize', ()=> setSlide(index));
    }

    // Load carousel slides from JSON
    fetch('content/carousel-slides.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load carousel-slides.json')))
        .then(data => {
            const carouselSlides = (data && Array.isArray(data.carouselSlides)) ? data.carouselSlides : [];
            
            // Clear existing content
            track.innerHTML = '';
            dotsNav.innerHTML = '';
            
            // Create slides and dots
            carouselSlides.forEach((slideData, slideIndex) => {
                const slide = createSlide(slideData, slideIndex);
                const dot = createDot(slideIndex);
                
                track.appendChild(slide);
                dotsNav.appendChild(dot);
            });
            
            // Update references
            slides = Array.from(track.children);
            dots = Array.from(dotsNav.children);
            
            // Initialize carousel functionality
            initializeCarousel();
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Header menu toggle (mobile)
(function(){
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('primary-nav');
    if(!toggle || !nav) return;
    toggle.addEventListener('click', ()=>{
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when clicking outside
    document.addEventListener('click', (e)=>{
        if(!nav.classList.contains('is-open')) return;
        const within = nav.contains(e.target) || toggle.contains(e.target);
        if(!within){
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded','false');
        }
    });
    // Close on escape
    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && nav.classList.contains('is-open')){
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded','false');
        }
    });
})();

// Splash screen slide down
(function(){
    const splash = document.getElementById('splash');
    if(!splash) return;
    function hideSplash(){
        splash.classList.add('is-hidden');
        setTimeout(()=>{ if(splash && splash.parentNode){ splash.parentNode.removeChild(splash); } }, 650);
    }
    if(document.readyState === 'complete'){
        setTimeout(hideSplash, 1000);
    } else {
        window.addEventListener('load', ()=> setTimeout(hideSplash, 1000));
    }
})();

// Load and render shows from CMS JSON
(function(){
    const grid = document.getElementById('shows-grid') || document.querySelector('.shows-grid');
    if(!grid) return;

    // Check if we're on the index page
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    
    // Store all shows data globally for filtering
    let allShows = [];
    let seeMoreButton = null;

    function createCard(show){
        const card = document.createElement('div');
        card.className = 'show-card';
        card.setAttribute('data-category', show.category || 'documentary');

        const img = document.createElement('img');
        img.src = show.image;
        const name = show.name || show.title;
        img.alt = show.alt || name || 'Show image';
        card.appendChild(img);

        const meta = document.createElement('div');
        meta.className = 'show-meta';

        const titleEl = document.createElement('h5');
        titleEl.className = 'show-name';
        titleEl.textContent = name || '';
        meta.appendChild(titleEl);

        const subEl = document.createElement('p');
        subEl.className = 'show-subline';
        const parts = [];
        if (show.production) parts.push(show.production);
        if (show.date) {
            try {
                const d = new Date(show.date);
                const formatted = isNaN(d.getTime()) ? show.date : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
                parts.push(formatted);
            } catch(_) {
                parts.push(show.date);
            }
        }
        subEl.textContent = parts.join(' • ');
        meta.appendChild(subEl);

        card.appendChild(meta);

        return card;
    }

    function createSeeMoreButton() {
        const button = document.createElement('a');
        button.href = './productions.html';
        button.className = 'secondary-button';
        button.textContent = 'See more';
        button.style.margin = '40px auto 0 auto';
        button.style.display = 'block';
        button.style.width = 'fit-content';
        return button;
    }

    function renderShows(shows, currentFilter = 'all') {
        grid.innerHTML = '';
        
        // Remove existing see more button
        if (seeMoreButton && seeMoreButton.parentNode) {
            seeMoreButton.parentNode.removeChild(seeMoreButton);
            seeMoreButton = null;
        }
        
        if (isIndexPage) {
            // On index page, limit to 30 shows per category
            const filteredShows = currentFilter === 'all' ? shows : shows.filter(show => show.category === currentFilter);
            
            if (filteredShows.length > 30) {
                const limitedShows = filteredShows.slice(0, 30);
                limitedShows.forEach(show => grid.appendChild(createCard(show)));
                
                // Add "See more" button after the grid
                seeMoreButton = createSeeMoreButton();
                grid.parentNode.appendChild(seeMoreButton);
            } else {
                filteredShows.forEach(show => grid.appendChild(createCard(show)));
            }
        } else {
            // On other pages, show all shows
            shows.forEach(show => grid.appendChild(createCard(show)));
        }
    }

    // Make renderShows globally available for the filter function
    window.renderShows = renderShows;
    window.allShows = allShows;

    fetch('content/shows.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load shows.json')))
        .then(data => {
            allShows = (data && Array.isArray(data.shows)) ? data.shows : [];
            
            // Sort shows by date (most recent first)
            allShows.sort((a, b) => {
                const dateA = new Date(a.date || '1900-01-01');
                const dateB = new Date(b.date || '1900-01-01');
                return dateB - dateA; // Most recent first
            });
            
            // Update global reference
            window.allShows = allShows;
            
            // Initial render
            renderShows(allShows);
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Load and render team members from CMS JSON
(function(){
    const grid = document.getElementById('team-members-grid');
    if(!grid) return;

    function createTeamMemberCard(member){
        const card = document.createElement('div');
        card.className = 'team-member vertical v-4';
        
        // Make card clickable if description exists
        if (member.description && member.description.trim()) {
            card.style.cursor = 'pointer';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `View ${member.name}'s profile`);
        }

        const img = document.createElement('img');
        img.src = member.image;
        img.alt = member.name || 'Team member photo';
        card.appendChild(img);

        const nameEl = document.createElement('h4');
        nameEl.className = 'primary-text';
        nameEl.textContent = member.name || '';
        card.appendChild(nameEl);

        if (member.credentials && member.credentials.trim()) {
            const credentialsEl = document.createElement('p');
            credentialsEl.className = 'secondary-text';
            credentialsEl.textContent = member.credentials;
            card.appendChild(credentialsEl);
        }

        const titleEl = document.createElement('p');
        titleEl.className = 'secondary-text bold';
        titleEl.textContent = member.title || '';
        card.appendChild(titleEl);

        // Add click handler if description exists
        if (member.description && member.description.trim()) {
            const clickHandler = () => openTeamMemberModal(member);
            card.addEventListener('click', clickHandler);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clickHandler();
                }
            });
        }

        return card;
    }

    fetch('content/team-members.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load team-members.json')))
        .then(data => {
            const teamMembers = (data && Array.isArray(data.teamMembers)) ? data.teamMembers : [];
            grid.innerHTML = '';
            teamMembers.forEach(member => grid.appendChild(createTeamMemberCard(member)));
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Team member modal functionality
(function(){
    const modal = document.getElementById('team-member-modal');
    if(!modal) return;
    
    const modalTitle = modal.querySelector('.modal-title');
    const modalSubtitle = modal.querySelector('.modal-subtitle');
    const modalText = modal.querySelector('.modal-text');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    // Simple markdown to HTML converter
    function markdownToHtml(markdown) {
        if (!markdown) return '';
        
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/__(.*?)__/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/_(.*?)_/gim, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        return '<p>' + html + '</p>';
    }

    window.openTeamMemberModal = function(member) {
        if (!member) return;
        
        modalTitle.textContent = member.name || '';
        modalSubtitle.textContent = member.title || '';
        modalText.innerHTML = markdownToHtml(member.description || '');
        
        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
            closeModal();
        }
    });
})();

// Load and render production partners from CMS JSON
(function(){
    const grid = document.getElementById('production-partners-grid');
    if(!grid) return;

    function createProductionPartnerCard(partner){
        const img = document.createElement('img');
        img.className = 'production-partner-img fill';
        img.src = partner.image;
        img.alt = 'Production partner logo';
        return img;
    }

    fetch('content/production-partners.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load production-partners.json')))
        .then(data => {
            const partners = (data && Array.isArray(data.productionPartners)) ? data.productionPartners : [];
            grid.innerHTML = '';
            partners.forEach(partner => grid.appendChild(createProductionPartnerCard(partner)));
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Load and render testimonials from CMS JSON
(function(){
    const container = document.getElementById('testimonials-container');
    if(!container) return;

    function createTestimonialCard(testimonial){
        const card = document.createElement('div');
        card.className = 'testimonial vertical v-24';

        const quoteImg = document.createElement('img');
        quoteImg.src = './assets/quote-sign.svg';
        quoteImg.className = 'quote-img';
        card.appendChild(quoteImg);

        const quote = document.createElement('p');
        quote.className = 'primary-text';
        quote.textContent = testimonial.quote || '';
        card.appendChild(quote);

        const authorInfo = document.createElement('div');
        authorInfo.className = 'vertical';

        const authorName = document.createElement('p');
        authorName.className = 'secondary-text';
        authorName.textContent = testimonial.authorName || '';
        authorInfo.appendChild(authorName);

        const authorTitle = document.createElement('p');
        authorTitle.className = 'secondary-text bold';
        authorTitle.textContent = testimonial.authorTitle || '';
        authorInfo.appendChild(authorTitle);

        card.appendChild(authorInfo);

        return card;
    }

    fetch('content/testimonials.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load testimonials.json')))
        .then(data => {
            const testimonials = (data && Array.isArray(data.testimonials)) ? data.testimonials : [];
            // Sort by order field
            testimonials.sort((a, b) => (a.order || 0) - (b.order || 0));
            container.innerHTML = '';
            testimonials.forEach(testimonial => container.appendChild(createTestimonialCard(testimonial)));
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Load and render services from CMS JSON
(function(){
    const servicesContainer = document.getElementById('our-services');
    if(!servicesContainer) return;

    // Store services data globally for modal functionality
    let servicesData = {};

    function createServiceCard(service){
        const card = document.createElement('div');
        card.className = 'card vertical border';
        
        // Handle special type (like production lifespan)
        if (service.specialType === 'lifeSpan') {
            card.id = 'card-production-lifespan';
            // Add click handler for lightbox
            card.addEventListener('click', () => {
                const imgSrc = './assets/mindzone-timeline.jpg';
                const imgAlt = 'Mindzone Timeline Image';
                if (window.openImageModal) {
                    window.openImageModal(imgSrc, imgAlt);
                }
            });
        } else {
            card.setAttribute('data-modal', service.slug);
        }

        const imageDiv = document.createElement('div');
        imageDiv.className = 'card-image';
        if (service.image) {
            const img = document.createElement('img');
            img.src = service.image;
            img.alt = service.title;
            imageDiv.appendChild(img);
        } else if (service.imageId) {
            imageDiv.id = service.imageId;
        }
        card.appendChild(imageDiv);

        const cardInfo = document.createElement('div');
        cardInfo.className = 'card-info horizontal h-16';

        const title = document.createElement('h4');
        title.className = 'primary-text fill';
        title.textContent = service.title;
        cardInfo.appendChild(title);

        const arrow = document.createElement('img');
        arrow.src = './assets/arrow-right.svg';
        cardInfo.appendChild(arrow);

        card.appendChild(cardInfo);

        return card;
    }

    // Load services and render them
    fetch('content/services.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load services.json')))
        .then(data => {
            const services = (data && Array.isArray(data.services)) ? data.services : [];
            
            // Sort by order
            services.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // Store services data for modal functionality
            services.forEach(service => {
                servicesData[service.slug] = service;
            });
            
            // Clear existing content
            servicesContainer.innerHTML = '';
            
            // Create and append service cards
            services.forEach(service => {
                servicesContainer.appendChild(createServiceCard(service));
            });
            
            // Update global reference for modal
            window.servicesData = servicesData;
            
            // Initialize modal after services are loaded
            initializeServicesModal();
        })
        .catch(() => {
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Modal functionality for services
(function(){
    let modalInitialized = false;
    
    function initializeServicesModal() {
        if (modalInitialized) return; // Prevent multiple initializations
        
        const modal = document.getElementById('modal');
        if(!modal) return;
        const modalTitle = modal.querySelector('.modal-title');
        const modalText = modal.querySelector('.modal-text');
        const modalActions = modal.querySelector('.modal-actions');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const servicesContainer = document.getElementById('our-services');

        function openModal(modalType) {
            const service = window.servicesData && window.servicesData[modalType];
            if (!service) return;

            modalTitle.textContent = service.title;
            modalText.textContent = service.description || '';
            
            // Show enquire button for services modals
            if (modalActions) {
                modalActions.style.display = 'block';
            }
            
            modal.classList.add('is-active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        function closeModal() {
            modal.classList.remove('is-active');
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Use event delegation for dynamically created cards
        if (servicesContainer) {
            servicesContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.card[data-modal]');
                if (!card) return;
                
                // Skip if it's the production lifespan card (handled separately)
                if (card.id === 'card-production-lifespan') return;
                
                const modalType = card.getAttribute('data-modal');
                if (modalType) {
                    openModal(modalType);
                }
            });
        }

        if(closeBtn) closeBtn.addEventListener('click', closeModal);
        if(overlay) overlay.addEventListener('click', closeModal);

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                closeModal();
            }
        });
        
        modalInitialized = true;
    }
    
    // Make function globally available
    window.initializeServicesModal = initializeServicesModal;
    
    // Initialize if modal exists
    if (document.getElementById('modal')) {
        initializeServicesModal();
    }
})();

// Shows filters
(function(){
    const container = document.querySelector('.shows-grid');
    const buttons = document.querySelectorAll('.filter-btn');
    if(!container || !buttons.length) return;

    function applyFilter(filter){
        // Use the global renderShows function if available
        if (window.renderShows && window.allShows) {
            window.renderShows(window.allShows, filter);
        } else {
            // Fallback to original logic for non-index pages
            const cards = container.querySelectorAll('.show-card');
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                const show = filter === 'all' || category === filter;
                card.style.display = show ? '' : 'none';
            });
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
            btn.classList.add('is-active');
            btn.setAttribute('aria-selected','true');
            applyFilter(btn.getAttribute('data-filter'));
        });
    });

    // default
    applyFilter('all');
})();

// Load and render case studies from CMS JSON
(function(){
    const grid = document.getElementById('case-studies-grid');
    if(!grid) return;

    function createCaseStudyCard(caseStudy){
        const link = document.createElement('a');
        link.className = 'case-study-card-link';
        
        // Set URL based on type
        if (caseStudy.type === 'internal') {
            link.href = `./case-study.html?slug=${caseStudy.slug}`;
        } else {
            link.href = caseStudy.externalUrl;
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }

        const card = document.createElement('div');
        card.className = 'case-study-card vertical border fill';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'case-study-card-image';
        imageDiv.style.backgroundImage = `url(${caseStudy.image})`;
        card.appendChild(imageDiv);

        const info = document.createElement('div');
        info.className = 'vertical v-8 case-study-card-info';

        const title = document.createElement('h4');
        title.className = 'primary-text';
        title.textContent = caseStudy.title || '';
        info.appendChild(title);

        const description = document.createElement('p');
        description.className = 'secondary-text';
        let descText = caseStudy.description || '';
        // Truncate to 150 characters at word boundary
        if (descText.length > 150) {
            descText = descText.substring(0, 150);
            // Find the last space to avoid cutting words
            const lastSpace = descText.lastIndexOf(' ');
            if (lastSpace > 0) {
                descText = descText.substring(0, lastSpace);
            }
            descText = descText.trim() + '...';
        }
        description.textContent = descText;
        info.appendChild(description);

        card.appendChild(info);
        link.appendChild(card);

        return link;
    }

    fetch('content/case-studies.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load case-studies.json')))
        .then(data => {
            const caseStudies = (data && Array.isArray(data.caseStudies)) ? data.caseStudies : [];
            // Sort by order field
            caseStudies.sort((a, b) => (a.order || 0) - (b.order || 0));
            grid.innerHTML = '';
            caseStudies.forEach(caseStudy => grid.appendChild(createCaseStudyCard(caseStudy)));
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Load and render about-us content from CMS JSON
(function(){
    const titleEl = document.getElementById('about-us-title');
    const textEl = document.getElementById('about-us-text');
    if(!titleEl || !textEl) return;

    fetch('content/about-us.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load about-us.json')))
        .then(data => {
            if (data.title) {
                titleEl.textContent = data.title;
            }
            if (data.text) {
                textEl.textContent = data.text;
            }
        })
        .catch(()=>{
            // If fetch fails, leave whatever is in the HTML or keep empty silently
        });
})();

// Load and render broadcasters as infinite carousel
(function(){
    const track = document.getElementById('broadcasters-track');
    if(!track) return;

    function createBroadcasterLogo(broadcaster){
        const img = document.createElement('img');
        img.src = broadcaster.image;
        img.alt = 'Broadcaster logo';
        return img;
    }

    fetch('content/broadcasters.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load broadcasters.json')))
        .then(data => {
            const broadcasters = (data && Array.isArray(data.broadcasters)) ? data.broadcasters : [];
            
            // Clear existing content
            track.innerHTML = '';
            
            // Create logos
            broadcasters.forEach(broadcaster => {
                track.appendChild(createBroadcasterLogo(broadcaster));
            });
            
            // Duplicate the logos for seamless infinite scroll
            broadcasters.forEach(broadcaster => {
                track.appendChild(createBroadcasterLogo(broadcaster));
            });
        })
        .catch(()=>{
            // If fetch fails, keep empty silently
        });
})();

// Image lightbox for shows grid and infographic
(function(){
    const grid = document.querySelector('.shows-grid');
    const modal = document.getElementById('image-modal');
    if(!modal) return;
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const img = modal.querySelector('.image-modal-img');

    function open(src, alt){
        img.src = src;
        img.alt = alt || 'Expanded image';
        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }
    
    // Make open function globally available for services
    window.openImageModal = open;
    function close(){
        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
        img.src = '';
    }

    if(grid){
        grid.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.tagName === 'IMG'){
                open(target.src.replace(/w=\d+/, 'w=1600'), target.alt);
            }
        });
    }
    
    // Add click listener for mindzone infographic
    const infographic = document.getElementById('mindzone-infographic');
    if(infographic) {
        infographic.addEventListener('click', (e) => {
            open(e.target.src, e.target.alt || 'Mindzone Infographic');
        });
    }
    const cardLifespan = document.getElementById('card-production-lifespan');
    if (cardLifespan) {
      cardLifespan.addEventListener('click', () => {
        const imgSrc = './assets/mindzone-timeline.jpg' // ← specify your image path here
        const imgAlt = 'Mindzone Timeline Image'; // ← optional alt text
        open(imgSrc, imgAlt);
      });
    }
    
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('is-active')) close(); });
})();