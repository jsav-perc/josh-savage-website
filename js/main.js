// Josh Savage Website - Main JavaScript

// Lightbox functions
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// Google Calendar Integration for Gigs
const CALENDAR_ID = '76a21ba3e764396d118aa7f7e2ef83b428f7ae50b301aec3b3ec226a68d97d6c@group.calendar.google.com';
const API_KEY = 'AIzaSyAS2ZpCX62QXbU-5kYLlPr7fw9RBYVZy_E';

// Extract URL from text (for ticket links in description)
function extractUrl(text) {
    if (!text) return null;
    const urlMatch = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
    return urlMatch ? urlMatch[0] : null;
}

// Get description text without URLs
function getDescriptionText(text) {
    if (!text) return null;
    // Remove URLs and trim
    const cleaned = text.replace(/https?:\/\/[^\s<>"{}|\\^`[\]]+/g, '').trim();
    return cleaned || null;
}

// Fetch and display gigs from Google Calendar
const INITIAL_GIGS_SHOWN = 3;

async function fetchCalendarGigs() {
    const gigsList = document.querySelector('.gigs-list');
    if (!gigsList) return;

    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const gigsHtml = data.items.map((event, index) => {
                const date = new Date(event.start.dateTime || event.start.date);
                const day = date.getDate();
                const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
                const title = event.summary || 'TBA';
                const venue = event.location || 'Venue TBA';
                const ticketUrl = extractUrl(event.description);
                const extraInfo = getDescriptionText(event.description);
                const hiddenClass = index >= INITIAL_GIGS_SHOWN ? ' gig-hidden' : '';

                return `
                    <div class="gig-item${hiddenClass}">
                        <div class="gig-date">
                            <span class="gig-day">${day}</span>
                            <span class="gig-month">${month}</span>
                        </div>
                        <div class="gig-info">
                            <h4 class="gig-title">${title}</h4>
                            <p class="gig-venue">${venue}</p>
                            ${extraInfo ? `<p class="gig-extra">${extraInfo}</p>` : ''}
                        </div>
                        ${ticketUrl
                            ? `<div class="gig-action"><a href="${ticketUrl}" target="_blank" rel="noopener" class="btn btn-small">Tickets</a></div>`
                            : ''
                        }
                    </div>
                `;
            }).join('');

            gigsList.innerHTML = gigsHtml;

            // Add show more/less button if there are more than 3 gigs
            if (data.items.length > INITIAL_GIGS_SHOWN) {
                gigsList.insertAdjacentHTML('afterend', `<div class="gigs-toggle"><button class="btn gigs-toggle-btn">Show More</button></div>`);

                const toggleBtn = document.querySelector('.gigs-toggle-btn');
                let expanded = false;

                toggleBtn.addEventListener('click', function() {
                    expanded = !expanded;
                    document.querySelectorAll('.gig-item').forEach((el, index) => {
                        if (index >= INITIAL_GIGS_SHOWN) {
                            el.classList.toggle('gig-hidden', !expanded);
                        }
                    });
                    this.textContent = expanded ? 'Show Less' : 'Show More';
                });
            }
        }
        // If no events, keep the existing placeholder
    } catch (error) {
        console.error('Failed to fetch gigs:', error);
        // Keep existing placeholder on error
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch gigs from Google Calendar
    fetchCalendarGigs();
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Nav background on scroll
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.borderBottomColor = 'rgba(255, 20, 147, 0.2)';
        } else {
            nav.style.borderBottomColor = '';
        }

        lastScroll = currentScroll;
    });

    // Fade in elements on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe sections and credit items
    document.querySelectorAll('.section, .credit-item, .gig-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Stagger animation for credit items
    document.querySelectorAll('.credits-grid').forEach(grid => {
        const items = grid.querySelectorAll('.credit-item');
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
        });
    });

    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.nav').offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Add active link style
    const activeStyle = document.createElement('style');
    activeStyle.textContent = `
        .nav-menu a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(activeStyle);
});
