// Basic interactions for prototype: mobile menu, swap fields, flatpickr datepicker, traveler placeholder
document.addEventListener('DOMContentLoaded', function(){
  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if(mobileBtn && mobileMenu){
    mobileBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('open'));
  }

  // Swap button (on flights page)
  const swapBtn = document.getElementById('swapBtn');
  if(swapBtn){
    swapBtn.addEventListener('click', ()=>{
      const from = document.getElementById('from');
      const to = document.getElementById('to');
      const t = from.value;
      from.value = to.value;
      to.value = t;
    });
  }

  // flatpickr datepicker for any input with class .datepicker
  if(typeof flatpickr !== 'undefined'){
    flatpickr('.datepicker', {
      mode: 'range',
      dateFormat: 'D, M j',
      minDate: 'today',
      onChange: function(sd, s, inst){
        // fill placeholder handled by flatpickr input directly
      }
    });
  }

  // traveler button demo
  const travelerBtn = document.getElementById('travelerBtn');
  if(travelerBtn){
    travelerBtn.addEventListener('click', ()=>{
      alert('Open traveler picker (demo). Implement a modal or dropdown for selecting adults/children/cabin.');
    });
  }

  // hero search prevent default (demo)
  const heroSearch = document.getElementById('heroSearch');
  if(heroSearch){
    heroSearch.addEventListener('submit', (e)=>{
      e.preventDefault();
      alert('Search demo — implement navigation to search results or API.');
    });
  }
});

// --- Carousel scrolling & package tab behavior (add to bottom of js/app.js) ---
(function(){
  // simple horizontal scroll controls
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const row = wrapper.querySelector('[data-scroll-container]');
    const prev = wrapper.querySelector('.carousel-control.prev');
    const next = wrapper.querySelector('.carousel-control.next');
    if(!row) return;
    const scrollAmount = Math.round(wrapper.clientWidth * 0.8);

    if(prev){
      prev.addEventListener('click', () => {
        row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if(next){
      next.addEventListener('click', () => {
        row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  });

  // package tab switching
  document.querySelectorAll('.packages-tabs .nav-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab');
      // toggle active class on tab buttons
      btn.parentElement.parentElement.querySelectorAll('.nav-link').forEach(n=>n.classList.remove('active'));
      btn.classList.add('active');

      // show/hide panels
      document.querySelectorAll('.tab-panel').forEach(panel=>{
        if(panel.id === tab){
          panel.style.display = ''; panel.classList.add('active');
        } else {
          panel.style.display = 'none'; panel.classList.remove('active');
        }
      });
    });
  });

  // allow dragging scroll on desktop for better UX
  document.querySelectorAll('[data-scroll-container]').forEach(sc => {
    let isDown=false, startX, scrollLeft;
    sc.addEventListener('mousedown', (e)=>{
      isDown=true; sc.classList.add('dragging'); startX = e.pageX - sc.offsetLeft; scrollLeft = sc.scrollLeft;
    });
    sc.addEventListener('mouseleave', ()=>{ isDown=false; sc.classList.remove('dragging'); });
    sc.addEventListener('mouseup', ()=>{ isDown=false; sc.classList.remove('dragging'); });
    sc.addEventListener('mousemove', (e)=>{
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - sc.offsetLeft;
      const walk = (x - startX) * 1.2;
      sc.scrollLeft = scrollLeft - walk;
    });
  });
})();

