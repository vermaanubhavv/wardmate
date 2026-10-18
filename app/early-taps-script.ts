// Plain module (not "use client") so the root layout, a server component, gets the string
// itself. See app/early-taps.tsx for what it does.
export const EARLY_TAPS_SCRIPT = `(function(){var w=window;w.__wmTap=null;w.__wmReady=false;
document.addEventListener("click",function(e){if(w.__wmReady)return;
var t=e.target,el=t&&t.closest&&t.closest('button,[role="button"]');if(!el||el.closest("a[href]"))return;
if(el.tagName==="BUTTON"&&el.form&&el.type==="submit")return;
e.preventDefault();e.stopPropagation();w.__wmTap={el:el,at:Date.now()};},true);})();`;
