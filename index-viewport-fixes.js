// index-viewport-fixes.js
// Extracted from inline script in index.html to comply with stricter CSP

(function() {
  // ONLY run on Safari mobile (not Chrome mobile)
  if (/Safari/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent)) {
    // Comprehensive Safari mobile centering fix
    (function() {
      function fixSafariMobileCentering() {
        // Force body and html to proper width
        document.documentElement.style.width = '100%';
        document.documentElement.style.maxWidth = '100%';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.documentElement.style.webkitTextSizeAdjust = '100%';
        
        document.body.style.width = '100%';
        document.body.style.maxWidth = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.position = 'relative';
        document.body.style.left = '0';
        document.body.style.transform = 'none';
        document.body.style.webkitTransform = 'none';
        document.body.style.overflowX = 'hidden';
        
        // Fix container positioning
        var container = document.querySelector('.container');
        if (container) {
          container.style.width = '100%';
          container.style.maxWidth = '100%';
          container.style.margin = '0';
          container.style.padding = '20px 15px';
          container.style.boxSizing = 'border-box';
          container.style.position = 'relative';
          container.style.left = '0';
          container.style.transform = 'none';
          container.style.webkitTransform = 'none';
          container.style.textAlign = 'center';
          container.style.display = 'block';
        }
        
        // Fix hero, tagline, and cta positioning
        var hero = document.querySelector('.hero');
        if (hero) {
          hero.style.width = '100%';
          hero.style.marginLeft = 'auto';
          hero.style.marginRight = 'auto';
          hero.style.textAlign = 'center';
          hero.style.position = 'relative';
          hero.style.left = '0';
          hero.style.transform = 'none';
        }
        
        var tagline = document.querySelector('.tagline');
        if (tagline) {
          tagline.style.width = '100%';
          tagline.style.marginLeft = 'auto';
          tagline.style.marginRight = 'auto';
          tagline.style.textAlign = 'center';
          tagline.style.position = 'relative';
          tagline.style.left = '0';
          tagline.style.transform = 'none';
        }
        
        var cta = document.querySelector('.cta');
        if (cta) {
          cta.style.width = '100%';
          cta.style.marginLeft = 'auto';
          cta.style.marginRight = 'auto';
          cta.style.textAlign = 'center';
          cta.style.position = 'relative';
          cta.style.left = '0';
          cta.style.transform = 'none';
        }
      }
      
      function handleViewportFix() {
        // Force proper initial scale immediately
        var viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          // Temporarily set to fixed scale
          viewport.content = 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
        
        // Apply centering fix
        fixSafariMobileCentering();
        
        // Reset viewport after a short delay
        setTimeout(function() {
          if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover';
          }
          window.scrollTo(0, 0);
          fixSafariMobileCentering(); // Apply fix again after viewport change
        }, 50);
      }
      
      // Apply fix immediately
      handleViewportFix();
      
      // Apply fix after DOM is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(handleViewportFix, 10);
        });
      } else {
        setTimeout(handleViewportFix, 10);
      }
      
      // Apply fix after window loads
      window.addEventListener('load', function() {
        setTimeout(fixSafariMobileCentering, 10);
      });
      
      // Additional fix on page show (handles back button, home button navigation)
      window.addEventListener('pageshow', function(event) {
        setTimeout(function() {
          window.scrollTo(0, 0);
          fixSafariMobileCentering();
          
          // Force viewport refresh
          var viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            var content = viewport.content;
            viewport.content = 'width=device-width, initial-scale=1.0';
            setTimeout(function() {
              viewport.content = content;
              fixSafariMobileCentering();
            }, 10);
          }
        }, 10);
      });
      
      // Handle orientation changes (Safari mobile only)
      window.addEventListener('orientationchange', function() {
        setTimeout(function() {
          window.scrollTo(0, 0);
          fixSafariMobileCentering();
        }, 100);
      });
      
      // Handle resize events
      window.addEventListener('resize', function() {
        if (window.innerWidth <= 480) {
          fixSafariMobileCentering();
        }
      });
    })();
  }
  
  // Chrome mobile centering fix
  if (/Chrome/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent)) {
    // Immediate fix for Chrome mobile rendering issues
    (function() {
      function fixChromeMobileCentering() {
        // Force body and html to proper width
        document.documentElement.style.width = '100%';
        document.documentElement.style.maxWidth = '100%';
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.width = '100%';
        document.body.style.maxWidth = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.position = 'relative';
        document.body.style.left = '0';
        document.body.style.transform = 'none';
        
        // Fix container positioning
        var container = document.querySelector('.container');
        if (container) {
          container.style.width = '100%';
          container.style.maxWidth = '100%';
          container.style.margin = '0';
          container.style.padding = '20px 15px';
          container.style.boxSizing = 'border-box';
          container.style.position = 'relative';
          container.style.left = '0';
          container.style.transform = 'none';
          container.style.textAlign = 'center';
        }
      }
      
      // Apply fix immediately
      fixChromeMobileCentering();
      
      // Apply fix after DOM is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixChromeMobileCentering);
      } else {
        fixChromeMobileCentering();
      }
      
      // Apply fix after window loads
      window.addEventListener('load', fixChromeMobileCentering);
      
      // Handle orientation changes
      window.addEventListener('orientationchange', function() {
        setTimeout(fixChromeMobileCentering, 100);
      });
      
      // Handle resize events
      window.addEventListener('resize', function() {
        if (window.innerWidth <= 480) {
          fixChromeMobileCentering();
        }
      });
    })();
  }
})();

