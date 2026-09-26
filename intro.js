// Runs before the page paints: marks the body for the chilli intro on a first visit this session.
(function(){try{var seen=sessionStorage.getItem("picante_intro");if(!seen&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&(window.scrollY||0)<80){document.body.classList.add("prelaunch");}}catch(e){}})();
