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

// Splash screen slide-down
(function(){
    const splash = document.getElementById('splash');
    if(!splash) return;
    function hideSplash(){
        splash.classList.add('is-hidden');
        setTimeout(()=>{ if(splash && splash.parentNode){ splash.parentNode.removeChild(splash); } }, 550);
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

    fetch('content/shows.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load shows.json')))
        .then(data => {
            const shows = (data && Array.isArray(data.shows)) ? data.shows : [];
            grid.innerHTML = '';
            shows.forEach(show => grid.appendChild(createCard(show)));
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
        card.className = 'team-member vertical v-8';
        
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

        const nameEl = document.createElement('h3');
        nameEl.className = 'primary-text';
        nameEl.textContent = member.name || '';
        card.appendChild(nameEl);

        const titleEl = document.createElement('p');
        titleEl.className = 'secondary-text';
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

// Modal functionality
(function(){
    const modal = document.getElementById('modal');
    if(!modal) return;
    const modalTitle = modal.querySelector('.modal-title');
    const modalText = modal.querySelector('.modal-text');
    const modalImage = modal.querySelector('.modal-image');
    const modalFeatures = modal.querySelector('.modal-features');
    const modalActions = modal.querySelector('.modal-actions');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const cards = document.querySelectorAll('.card[data-modal]');

    // Modal content data
    const modalData = {
        support: {
            title: 'Support for TV, Films and Podcasts',
            text: 'Mindzone Media can supply, at short notice, Clinical Psychologists (Chartered and HCPC registered) with specialist expert experience for any type of television or filming project in the UK or Overseas. This may include pre-production screening, support during production (on/off rig) and post-TX support. We work across all televisions genres, as well as commercials/marketing projects, television dramas and mainstream films, including storyline development, script reviews, consultation and support for actors, compliance reviews, podcasts, as well as performance art projects.'
        },
        mentalHealth: {
            title: 'Mental Health, First Aid Training',
            text: "Training workshops are offered to improve production team's knowledge of mental health presentations for contributors and talent, minimise attrition and wastage, maintain the rights and dignity of vulnerable individuals, manage risk appropriately, supporting compliance requirements, and raising awareness for production team's self-care. Training workshops are offered to improve production team's knowledge of mental health presentations for contributors and talent, minimise attrition and wastage, maintain the rights and dignity of vulnerable individuals, manage risk appropriately, supporting compliance requirements, and raising awareness for production team's self-care."
        },
        dutyOfCare: {
            title: 'Duty Of Care For Contributors',
            text: 'We offer pre-filming assessments for contributors to identify any psychological vulnerabilities which may be affected by their participation in any production. We will then offer recommendations and guidance on how to proceed with any contributor throughout the production process. We can also offer on-set support for contributors and the production team. We then suggest that some contributors might need a follow up session either pre or post TX. Especially if the production might be psychologically triggering for them.'
        },
        script: {
            title: 'Script and Development Treatment Reviews',
            text: 'At the beginning of your production you can get professional script and development treatment reviews from our specialist media psychologists at Mindzone Media. Our team of experienced professionals will provide thorough and detailed feedback on your script and development treatment, helping to manage risk surrounding sensitive themes and scenes and advise on psychological safety for actors and contributors.'
        },
        employeeAssistance: {
            title: 'Employee Assistance and Staff Support',
            text: 'Our team of highly experienced Consultant Clinical Psychologists provide dedicated employee assistance and staff support tailored to the unique pressures of working in the Film, TV and media industry. We understand the fast-paced, high-pressure environments that production teams, cast, and crew often face, and we offer confidential one-to-one support, mental health awareness workshops, resilience training, debriefing, and crisis response when needed. Whether it’s managing stress, navigating difficult workplace dynamics, or supporting individuals through personal challenges, we deliver compassionate, professional care that promotes mental health, resilience, and sustainable performance across the industry and the lifespan of a project.'
        },
        onCallSupport: {
            title: 'Location / On Call Support',
            text: 'Mindzone Media provides comprehensive support to your staff, cast, and crew, whether on-site or remotely across international time zones. Our extensive experience includes working on large-format studio productions with over 750 contributors, as well as more specialised and concentrated projects in remote locations and sometimes hostile environments. Our team is capable of supporting any location. We are committed to ensuring the mental health needs of your crew, actors, and contributor cast by considering, containing, and providing appropriate support to mitigate potential mental health risks and challenges.'
        },
        lifeSpan: {
            title: 'Supporting the Life Span of a Production',
            text: '',
        }
        

    };

    function openModal(modalType) {
        const data = modalData[modalType];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalText.textContent = data.text;
        
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

    // Event listeners
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const modalType = card.getAttribute('data-modal');
            openModal(modalType);
        });
    });

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(overlay) overlay.addEventListener('click', closeModal);

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
            closeModal();
        }
    });
})();

// Shows filters
(function(){
    const container = document.querySelector('.shows-grid');
    const buttons = document.querySelectorAll('.filter-btn');
    if(!container || !buttons.length) return;

    function applyFilter(filter){
        const cards = container.querySelectorAll('.show-card');
        cards.forEach(card => {
            const category = card.getAttribute('data-category');
            const show = filter === 'all' || category === filter;
            card.style.display = show ? '' : 'none';
        });
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
        // Truncate to 200 characters at word boundary
        if (descText.length > 200) {
            descText = descText.substring(0, 200);
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