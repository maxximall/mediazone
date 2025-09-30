(function(){
    const track = document.querySelector('.carousel-track');
    if(!track) return;
    const slides = Array.from(track.children);
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsNav = document.querySelector('.carousel-dots');
    const dots = Array.from(dotsNav.children);
    let index = 0;
    let autoTimer;

    function setSlide(newIndex){
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

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    dots.forEach((dot,i)=> dot.addEventListener('click', ()=> setSlide(i)));

    function start(){ autoTimer = setInterval(next, 5000); }
    function stop(){ clearInterval(autoTimer); }
    const carousel = document.querySelector('.carousel');
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
    window.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
    window.addEventListener('resize', ()=> setSlide(index));
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
        img.alt = show.alt || show.title || 'Show image';
        card.appendChild(img);
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

// Modal functionality
(function(){
    const modal = document.getElementById('modal');
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
            text: 'Comprehensive mental health support tailored for the unique demands of media production. Our specialized services ensure the wellbeing of cast, crew, and contributors throughout the entire production lifecycle.',
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&auto=format&fit=crop',
            features: [
                '24/7 on-call psychological support',
                'Pre-production risk assessments',
                'Crisis intervention during filming',
                'Post-production debriefing sessions',
                'Customized support for sensitive content',
                'Talent and crew wellness programs'
            ]
        },
        training: {
            title: 'Training & Development Programs',
            text: 'Professional development programs designed to enhance mental health awareness and create supportive production environments. Our training empowers production teams with essential skills and knowledge.',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop',
            features: [
                'Mental health first aid for production teams',
                'Recognizing and responding to psychological distress',
                'Creating psychologically safe work environments',
                'Managing challenging content and situations',
                'Leadership training for production managers',
                'Customized workshops for specific productions'
            ]
        },
        consultation: {
            title: 'Professional Consultation Services',
            text: 'Expert psychological consultation services for complex productions, sensitive content, and challenging situations. Our experienced clinical psychologists provide strategic guidance and support.',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop',
            features: [
                'Production risk assessment and planning',
                'Content sensitivity analysis',
                'Crisis management consultation',
                'Psychological safety audits',
                'Expert witness services',
                'Post-incident support and analysis'
            ]
        }
    };

    function openModal(modalType) {
        const data = modalData[modalType];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalText.textContent = data.text;
        modalImage.style.backgroundImage = `url('${data.image}')`;
        
        // Clear existing features
        modalFeatures.innerHTML = '';
        
        // Add new features
        data.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            modalFeatures.appendChild(li);
        });

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

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

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

// Image lightbox for shows grid
(function(){
    const grid = document.querySelector('.shows-grid');
    const modal = document.getElementById('image-modal');
    if(!grid || !modal) return;
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

    grid.addEventListener('click', (e)=>{
        const target = e.target;
        if(target && target.tagName === 'IMG'){
            open(target.src.replace(/w=\d+/, 'w=1600'), target.alt);
        }
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('is-active')) close(); });
})();