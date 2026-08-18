$(function () {
  var $window = $(window);
  var $header = $("#siteHeader");
  var $navToggle = $("#navToggle");
  var $mainNav = $("#mainNav");
  var $navLinks = $(".nav-link");
  var $progressBar = $("#progressBar");
  var $sections = $("main .section, .hero");

  $("#year").text(new Date().getFullYear());

  // Mobile nav toggle
  $navToggle.on("click", function () {
    var isOpen = $mainNav.toggleClass("is-open").hasClass("is-open");
    $navToggle.toggleClass("is-open", isOpen).attr("aria-expanded", isOpen);
  });

  $navLinks.on("click", function () {
    $mainNav.removeClass("is-open");
    $navToggle.removeClass("is-open").attr("aria-expanded", false);
  });

  // Scroll progress bar
  function updateProgressBar() {
    var scrollTop = $window.scrollTop();
    var docHeight = $(document).height() - $window.height();
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    $progressBar.css("width", pct + "%");
  }

  // Scroll-spy: highlight active nav link
  function updateActiveNav() {
    var scrollPos = $window.scrollTop() + 120;
    var currentId = null;

    $sections.each(function () {
      var $section = $(this);
      var top = $section.offset().top;
      var bottom = top + $section.outerHeight();
      if (scrollPos >= top && scrollPos < bottom && $section.attr("id")) {
        currentId = $section.attr("id");
      }
    });

    $navLinks.removeClass("active");
    if (currentId) {
      $navLinks.filter('[href="#' + currentId + '"]').addClass("active");
    }
  }

  // Reveal-on-scroll
  function revealOnScroll() {
    var viewportBottom = $window.scrollTop() + $window.height() - 80;
    $(".reveal:not(.is-visible)").each(function () {
      if ($(this).offset().top < viewportBottom) {
        $(this).addClass("is-visible");
      }
    });
  }

  $window.on("scroll", function () {
    updateProgressBar();
    updateActiveNav();
    revealOnScroll();
  });

  updateProgressBar();
  updateActiveNav();
  revealOnScroll();

  var RECAPTCHA_SITE_KEY = "6Lcnm4wtAAAAADr4T2oHm4Yx_xRx93kTjJZOKoCd";

  (function () {
    var $form = $("#contactForm");
    var $status = $("#formStatus");
    var $submitBtn = $form.find('button[type="submit"]');
    var $iframe = $("#hiddenFormFrame");
    var $recaptchaField = $("#g-recaptcha-response");
    var submitted = false;

    $iframe.on("load", function () {
      if (!submitted) return;
      submitted = false;
      $submitBtn.prop("disabled", false);
      $status
        .removeClass("is-error")
        .addClass("is-success")
        .text(
          "Thanks! Your message has been sent — I’ll get back to you soon.",
        );
      $form[0].reset();
    });

    $form.on("submit", function (e) {
      e.preventDefault();

      var action = $form.attr("action");
      if (!action || action.indexOf("YOUR_SCRIPT_ID") !== -1) {
        $status
          .removeClass("is-success")
          .addClass("is-error")
          .text(
            "Form isn’t configured yet — deploy google-apps-script/Code.gs and set its URL in index.html. Meanwhile, reach out directly via email or LinkedIn below.",
          );
        return;
      }

      if (
        RECAPTCHA_SITE_KEY === "YOUR_RECAPTCHA_SITE_KEY" ||
        typeof grecaptcha === "undefined"
      ) {
        $status
          .removeClass("is-success")
          .addClass("is-error")
          .text(
            "Spam protection isn’t configured yet — set a reCAPTCHA site key in index.html and js/script.js.",
          );
        return;
      }

      $submitBtn.prop("disabled", true);
      $status.removeClass("is-success is-error").text("Sending…");

      grecaptcha.ready(function () {
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact" }).then(
          function (token) {
            $recaptchaField.val(token);
            submitted = true;
            $form[0].submit();
          },
          function () {
            $submitBtn.prop("disabled", false);
            $status
              .removeClass("is-success")
              .addClass("is-error")
              .text(
                "Spam check failed to load. Please try again or email me directly below.",
              );
          },
        );
      });
    });
  })();

  // Project detail modal
  (function () {
    var projects = {
      antavaya: {
        tag: "Travel & Booking Platform",
        title: "Antavaya — Flight, Hotel & Tour Booking",
        description:
          "Backend engineering for Antavaya, an online travel booking platform for flights, hotels, and tours — including the internal CMS used to manage hotel listings, discounts, banners, and bookings at scale.",
        chips: ["Node.js", "REST API", "MariaDB", "Redis", "Docker"],
        images: [
          {
            src: "assets/images/antavaya_landing-page.jpeg",
            alt: "Antavaya travel booking landing page with flight, hotel, and tour search",
          },
          {
            src: "assets/images/antavaya_cms.jpeg",
            alt: "Antavaya internal CMS hotel management dashboard",
          },
        ],
      },
      uhealth: {
        tag: "Healthcare Management System",
        title: "Uhealth — Corporate Healthcare Dashboard",
        description:
          "Backend services for Uhealth, a corporate healthcare management system used to track employee vaccination records, clinics, and occupational health data across company sites.",
        chips: ["Node.js", "TypeScript", "PostgreSQL", "REST API"],
        images: [
          {
            src: "assets/images/uhealth_ugems_healthcare-system.jpeg",
            alt: "Uhealth corporate healthcare dashboard showing employee vaccination summary",
          },
        ],
      },
    };

    var $overlay = $("#projectModal");
    var $image = $("#modalImage");
    var $dots = $("#modalDots");
    var $prev = $("#modalPrev");
    var $next = $("#modalNext");
    var $lastFocused = null;
    var currentImages = [];
    var currentIndex = 0;

    function renderImage() {
      var img = currentImages[currentIndex];
      $image.attr("src", img.src).attr("alt", img.alt);
      $dots
        .find("span")
        .removeClass("is-active")
        .eq(currentIndex)
        .addClass("is-active");
    }

    function openModal(key) {
      var data = projects[key];
      if (!data) return;

      $("#modalTag").text(data.tag);
      $("#modalTitle").text(data.title);
      $("#modalDescription").text(data.description);

      var $chips = $("#modalChips").empty();
      $.each(data.chips, function (_, chip) {
        $chips.append($("<span>").addClass("chip chip-ghost").text(chip));
      });

      currentImages = data.images;
      currentIndex = 0;

      $dots.empty();
      if (currentImages.length > 1) {
        $.each(currentImages, function (i) {
          $("<span>").attr("data-index", i).appendTo($dots);
        });
        $prev.prop("hidden", false);
        $next.prop("hidden", false);
      } else {
        $prev.prop("hidden", true);
        $next.prop("hidden", true);
      }

      renderImage();

      $lastFocused = document.activeElement;
      $overlay.addClass("is-open").attr("aria-hidden", "false");
      $("#modalClose").trigger("focus");
      $("body").css("overflow", "hidden");
    }

    function closeModal() {
      $overlay.removeClass("is-open").attr("aria-hidden", "true");
      $("body").css("overflow", "");
      if ($lastFocused) $lastFocused.focus();
    }

    function showRelative(delta) {
      if (!currentImages.length) return;
      currentIndex =
        (currentIndex + delta + currentImages.length) % currentImages.length;
      renderImage();
    }

    $(".has-modal").on("click", function () {
      openModal($(this).data("project"));
    });

    $(".has-modal").on("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal($(this).data("project"));
      }
    });

    $("#modalClose").on("click", closeModal);
    $overlay.on("click", function (e) {
      if (e.target === this) closeModal();
    });

    $prev.on("click", function () {
      showRelative(-1);
    });
    $next.on("click", function () {
      showRelative(1);
    });

    $dots.on("click", "span", function () {
      currentIndex = $(this).data("index");
      renderImage();
    });

    $(document).on("keydown", function (e) {
      if (!$overlay.hasClass("is-open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showRelative(-1);
      if (e.key === "ArrowRight") showRelative(1);
    });
  })();
});
