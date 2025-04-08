document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle functionality
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.toggle('dark-mode', savedTheme === 'dark');
        if (themeSwitch) themeSwitch.checked = savedTheme === 'dark';
    } else {
        // Default to system preference if available
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.toggle('dark-mode', prefersDark);
        if (themeSwitch) themeSwitch.checked = prefersDark;
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
    
    // Theme toggle event listener
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            body.classList.toggle('dark-mode');
            // Save theme preference
            const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        });
    }
    
    // Slideshow functionality (only on homepage)
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        const prevBtn = document.querySelector('.prev-slide');
        const nextBtn = document.querySelector('.next-slide');
        let currentSlide = 0;
        let slideshowInterval;
        
        function showSlide(index) {
            // Remove active class from all slides
            slides.forEach(slide => slide.classList.remove('active'));
            
            // Ensure index wraps around
            currentSlide = (index + slides.length) % slides.length;
            
            // Add active class to current slide
            slides[currentSlide].classList.add('active');
        }
        
        // Next slide function
        function nextSlide() {
            showSlide(currentSlide + 1);
        }
        
        // Previous slide function
        function prevSlide() {
            showSlide(currentSlide - 1);
        }
        
        // Add event listeners to slide buttons
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        // Start automatic slideshow
        function startSlideshow() {
            slideshowInterval = setInterval(nextSlide, 5000);
        }
        
        // Pause slideshow on hover
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer) {
            slideshowContainer.addEventListener('mouseenter', () => {
                clearInterval(slideshowInterval);
            });
            
            slideshowContainer.addEventListener('mouseleave', () => {
                startSlideshow();
            });
        }
        
        // Initialize slideshow
        startSlideshow();
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Only prevent default and scroll if target is on this page
            if (document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger')) {
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Scroll to top button
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Animation on scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animateElements.forEach(element => {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.offsetTop;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            // Check if element is in viewport
            if ((elementBottomPosition >= windowTopPosition) && 
                (elementTopPosition <= windowBottomPosition)) {
                element.classList.add('animate-fade-in');
            }
        });
    }
    
    if (animateElements.length > 0) {
        window.addEventListener('scroll', checkIfInView);
        window.addEventListener('resize', checkIfInView);
        window.addEventListener('load', checkIfInView);
        
        // Initial check
        checkIfInView();
    }
    
    // Project filter functionality (for Projects page)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const filter = button.getAttribute('data-filter');
                
                projectCards.forEach(card => {
                    if (filter === 'all') {
                        card.style.display = 'flex';
                    } else {
                        // Check if card has the selected category
                        const categories = card.getAttribute('data-category').split(' ');
                        if (categories.includes(filter)) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
    
    // Career timeline animation (for Career page)
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length > 0) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });
        
        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }
    
// Contact form submission
// Initialize EmailJS with your Public Key (User ID)
emailjs.init("B5vJCTU7bGNupOTnV"); // Replace with your EmailJS User ID

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        const submitBtn = document.querySelector('.submit-btn');
        const formStatus = document.getElementById('form-status');
        
        // Basic validation
        if (!nameInput.value || !emailInput.value || !subjectInput.value || !messageInput.value) {
            formStatus.textContent = 'Please fill in all fields.';
            formStatus.className = 'form-status error';
            return;
        }
        
        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.className = 'form-status error';
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = 'Sending... <span class="loading-spinner"></span>';
        
        // Prepare form data for EmailJS
        const templateParams = {
            from_name: nameInput.value,
            from_email: emailInput.value,
            subject: subjectInput.value,
            message: messageInput.value
        };
        
        // Send email using EmailJS
        emailjs.send('service_1o38kqk', 'template_50ozu9a', templateParams)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                formStatus.textContent = 'Your message has been sent successfully! I will get back to you soon.';
                formStatus.className = 'form-status success';
                contactForm.reset();
            }, (error) => {
                console.error('FAILED...', error);
                formStatus.textContent = 'Error: There was an error sending your message. Please try again later.';
                formStatus.className = 'form-status error';
            })
            .finally(() => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Send Message';
            });
    });
}

    
    // Add mobile navigation functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('show');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar')) {
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    }
    
    // Page transitions
    window.addEventListener('pageshow', function(event) {
        const body = document.body;
        body.classList.add('page-visible');
    });
});

// Project filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Show or hide projects based on filter
            projectItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'flex';
                } else {
                    const categories = item.getAttribute('data-category').split(' ');
                    if (categories.includes(filterValue)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
            
            // Add smooth fade-in animation
            projectItems.forEach(item => {
                if (item.style.display === 'flex') {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 50);
                }
            });
        });
    });
    
    // Initialize with "All" filter active
    document.querySelector('.filter-btn[data-filter="all"]').click();
});