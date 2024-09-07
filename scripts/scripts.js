const Main = {
    dictionary: null,
    loadMenu() {
        Main.loadTemplate('menu', '.portfolio-frame-menu', {dictionary: Main.dictionary});
    },
    loadLang(lang) {
        if (lang === 'cookies') {
            let cookieVal = this.getCookie('lang'); // Pass the correct cookie name here
            lang = cookieVal ? cookieVal : this.getBrowserLanguage();
        }
        $.getJSON(`assets/endpoints/languages/lang_${lang}.json`, function (data) {
            Main.dictionary = data;
            Main.loadMenu();
            Main.handleRouting(); // Ensure routing is handled after loading the language
            Main.setCookie('lang', lang, 7);
        }).fail(function () {
            if (lang !== 'en') { // Prevent endless recursion if 'en' also fails
                console.log("Error loading JSON file. Loading English version.");
                Main.loadLang('en');
            } else {
                console.error("Failed to load the English language file as well."); // Log if fallback also fails
            }
        });
    },    
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null; // Zwraca null, jeśli ciasteczko nie istnieje
    },
    setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },
    getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        return lang.split('-')[0]; // Zwraca 'pl' z 'pl-PL'
    },
    getTheme(){
        let colorTheme = this.getCookie('colorTheme') ? this.getCookie('colorTheme') : "rgb(25, 24, 44)";

        $('.portfolio-background-option').each(function() {
            var currentColor = $(this).css('background-color');
            if (currentColor === colorTheme) {
                $(this).trigger('click');
            }
        });

        this.setCookie('colorTheme', colorTheme, 7);
    },
    events() {
        $('body').on('click', '.portfolio-socials[name="linkedin"]', function(e) {
            window.open('https://www.linkedin.com/in/piotr-bogus/', '_blank');
        });

        $('body').on('click', '.zoomable', function(e) {
            $('#imageModal').addClass('d-flex');
            $('#modalImage').attr('src', $(this).attr('src'));
        });
        $('body').on('click', '#modalImage', function(e) {
            $(this).toggleClass('zoomed');
        });
        $('body').on('click', '.close', function(e) {
            $('#imageModal').removeClass('d-flex');
            $('#modalImage').removeClass('zoomed')
        });
        $('body').on('click', function(e) {
            if ($(e.target).is($('#imageModal'))) {
                $('#imageModal').removeClass('d-flex');
                $('#modalImage').removeClass('zoomed');
            }
        });
        $('body').on('click', '.portfolio-cv-block', function(e) {
            let url = $(this).attr('data-url');
            window.open(url, '_blank');
        });
        $('body').on('click', '.portfolio-background-option', function(e) {
            // Pobranie wartości background-image z klikniętego elementu
            var bgColor = $(this).css('background-color');
            var hueRotateDeg = $(this).attr('id-deg');
            var lang = $(this).attr('data-lang');

            if (hueRotateDeg) {
                // Ustawienie tła dla body
                $('body').css('background-color', bgColor);
                Main.setCookie('colorTheme', bgColor, 7);
                
                Experience.techNameHue = 'hue-rotate(' + hueRotateDeg + 'deg)';
                $('.portfolio-tech-name').css('filter', Experience.techNameHue);
            }
            else if (lang) {
                Main.loadLang(lang);
                Main.loadMenu();
                Experience.show();
            }
        });
        $('body').on('click', '.lang-select', function(e) {
            $('.lang-select-wrapper').toggleClass('d-none');
        });
    },
    // Funkcja do załadowania i wstawienia szablonu Handlebars
    loadTemplate(templateFile, targetSelector, data = {}) {
        try {
            // Stworzenie obiektu XMLHttpRequest
            var xhr = new XMLHttpRequest();
            
            // Wczytanie szablonu Handlebars z pliku w trybie synchronicznym
            xhr.open('GET', `templates/${templateFile}.hbs`, false); // false - synchronicznie
            xhr.send();
            
            if (xhr.status !== 200) {
                throw new Error('Network response was not ok');
            }
            
            // Pobranie źródła szablonu
            var templateSource = xhr.responseText;
            
            // Kompilowanie szablonu Handlebars
            var template = Handlebars.compile(templateSource);
            
            // Renderowanie szablonu z danymi
            var html = template(data);
            
            // Wstawienie renderowanego HTML do elementu o określonym selektorze
            var targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                $(".portfolio-content-inner").fadeOut(200, function() {
                    targetElement.innerHTML = html;
                    $(".portfolio-content-inner").fadeIn(200);
                    Main.getTheme();
                    setTimeout(() => {
                        Main.scrollBar.updateScrollbar()
                      }, 0);
                });
            } else {
                console.error(`Element o selektorze "${targetSelector}" nie został znaleziony.`);
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas ładowania szablonu:', error);
        }
    },

    scrollBar: {
        $scrollContainer: $('body'),
        $scrollContent: $('.portfolio-content-inner'),
        $scrollbar: $('.custom-scrollbar'),
        scrollTimer: null,
    
        init() {
            this.$scrollContent.on('scroll', () => this.handleScroll());
            this.updateScrollbar();
        },
    
        updateScrollbar() {
            const containerHeight = this.$scrollContainer.height();
            const contentHeight = this.$scrollContent[0].scrollHeight;
            const scrollRatio = containerHeight / contentHeight;
            const scrollbarHeight = scrollRatio * containerHeight;
            const scrollbarTop = this.$scrollContent.scrollTop() * scrollRatio;
    
            this.$scrollbar.css({
                height: `${scrollbarHeight}px`,
                marginTop: `${scrollbarTop}px`
            });
        },
    
        handleScroll() {
            this.$scrollbar.css('opacity', 1);
            this.updateScrollbar();
    
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(() => {
                this.$scrollbar.css('opacity', 0);
            }, 200);
        }
    },

    handleRouting() {
        const hash = window.location.hash.substring(1); // Usuwamy '#'
        switch(hash) {
            case 'experience':
                Experience.show();
                break;
            case 'certificates':
                Certificates.show();
                break;
            case 'projects':
                Projects.show();
                break;
            default:
                Experience.show(); // Domyślny widok to 'experience'
        }
    }
}

const Experience = {
    techNameHue: 'hue-rotate(0 deg)',
    show() {
        $.getJSON('assets/endpoints/experience.json', function(data) {
            // Przypisanie JSONa do obiektu
            var experience = data;

            const mergedObjects = {
                experience: experience.Career,
                techNameHue: Experience.techNameHue,
                dictionary: Main.dictionary
            }

            Main.loadTemplate('experience', '.portfolio-content-inner', mergedObjects);
        }).fail(function() {
            console.log("Wystąpił błąd podczas ładowania pliku JSON.");
        });
    },
    events() {
        $('body').on('click', '.portfolio-menu-link[name="experience"]', function(e) {
            window.location.hash = 'experience'; // Ustawienie hasha w URL
        });
    }
}

const Certificates = {
    show() {
        Main.loadTemplate('certificates', '.portfolio-content-inner', {dictionary: Main.dictionary});
    },
    events() {
        $('body').on('click', '.portfolio-menu-link[name="certificates"]', function(e) {
            window.location.hash = 'certificates'; // Ustawienie hasha w URL
        });
    }
}

const Projects = {
    show() {
        $.getJSON('assets/endpoints/projects.json', function(data) {
            // Przypisanie JSONa do obiektu
            var projects = data;

            const mergedObjects = {
                projects: projects.Projects,
                dictionary: Main.dictionary
            }

            Main.loadTemplate('projects', '.portfolio-content-inner', mergedObjects);
        }).fail(function() {
            console.log("Wystąpił błąd podczas ładowania pliku JSON.");
        });


    },
    events() {
        $('body').on('click', '.portfolio-menu-link[name="projects"]', function(e) {
            window.location.hash = 'projects'; // Ustawienie hasha w URL
        });
        $('body').on('click', '.hamburger-menu-icon', function(e) {
            $('.hamburger-menu').toggleClass('d-none');
        });
        $('body').on('click', '.portfolio-menu-link-hamburger', function(e) {
            $('.hamburger-menu').toggleClass('d-none');
        });
    }
}

Main.loadLang('cookies');
Main.events();
Experience.events();
Certificates.events();
Projects.events();
Main.scrollBar.init();

// Obsługa zmian hasha w URL
window.addEventListener('hashchange', Main.handleRouting);
// Obsługa początkowego załadowania strony
window.addEventListener('load', Main.handleRouting);
