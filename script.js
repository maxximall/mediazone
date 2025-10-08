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

// Splash screen fade-out
(function(){
    const splash = document.getElementById('splash');
    if(!splash) return;
    function hideSplash(){
        splash.classList.add('is-hidden');
        setTimeout(()=>{ if(splash && splash.parentNode){ splash.parentNode.removeChild(splash); } }, 450);
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
            text: ''
        }
        

    };

    function openModal(modalType) {
        const data = modalData[modalType];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalText.textContent = data.text;
        
        
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
    
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('is-active')) close(); });
})();