(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))d(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&d(s)}).observe(document,{childList:!0,subtree:!0});function r(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function d(o){if(o.ep)return;o.ep=!0;const n=r(o);fetch(o.href,n)}})();const f={appReady:!1,forecastDataLoaded:!1,loadingSteps:[{id:"step1",icon:"⏳",text:"Initializing forecast..."},{id:"step2",icon:"📍",text:"Detecting your location"},{id:"step3",icon:"🌤️",text:"Fetching weather data"},{id:"step4",icon:"📊",text:"Analyzing pollen levels"}]},v={currentStep:0,totalSteps:4,countdownInterval:null,init(){this.currentStep=0,this.updateProgress(0),this.startCountdown(10)},updateStep(e,t="loading"){if(e>=0&&e<this.totalSteps){const r=document.getElementById(`step${e+1}`);if(!r)return;r.className=t,r.innerHTML=`
                <span class="status-icon">
                    ${t==="completed"?"✓":t==="error"?"✕":f.loadingSteps[e].icon}
                </span>
                <span class="status-text">${f.loadingSteps[e].text}</span>
            `}},updateProgress(e){const t=document.querySelector(".progress-bar");t&&(t.style.width=`${e}%`)},startCountdown(e){this.stopCountdown();let t=e;this.updateTimeRemaining(t),this.countdownInterval=setInterval(()=>{t--,this.updateTimeRemaining(t),t<=0&&this.stopCountdown()},1e3)},stopCountdown(){this.countdownInterval&&(clearInterval(this.countdownInterval),this.countdownInterval=null)},updateTimeRemaining(e){const t=document.getElementById("loadingTime");t&&(t.textContent=`Estimated time remaining: ${e} seconds`)}};document.addEventListener("DOMContentLoaded",function(){document.getElementById("forecastToggle");let e=null;document.getElementById("closeModal");let t=null;function r(){e=document.getElementById("forecastModal"),t=document.getElementById("forecastData"),d(),f.appReady=!0,v.init(),console.log("App initialized with forecastModal:",!!e,"forecastData:",!!t)}function d(){document.addEventListener("click",i=>{i.target.closest("#forecastToggle")&&o(),(i.target.closest(".close")||i.target.classList.contains("close"))&&n()}),e&&e.addEventListener("click",i=>{i.target===e&&n()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&e&&e.classList.contains("active")&&n()})}function o(){e&&(e.classList.contains("active")?n():(e.classList.add("active"),document.body.style.overflow="hidden",s()))}function n(){e&&(e.classList.remove("active"),document.body.style.overflow="",t&&(t.innerHTML=""),v.init())}async function s(){if(console.log("Starting forecast data load..."),!t){console.error("forecastData element not found");return}try{t.innerHTML=`
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading your personalized forecast...</p>
                </div>
            `,e&&(e.classList.add("active"),document.body.style.overflow="hidden");const i=await y(),{latitude:a,longitude:l}=i.coords;await new Promise(p=>setTimeout(p,1500));const c=[{level:"Low",color:"#4CAF50"},{level:"Moderate",color:"#FFC107"},{level:"High",color:"#FF9800"},{level:"Very High",color:"#F44336"}],{level:u,color:h}=c[Math.floor(Math.random()*c.length)],w={Low:["Enjoy outdoor activities with minimal risk","Continue with your normal routine","Keep windows open for fresh air"],Moderate:["Consider limiting outdoor activities if you're sensitive","Keep windows closed at night","Use air conditioning if possible"],High:["Limit time spent outdoors","Keep windows and doors closed","Use air purifiers indoors","Shower after being outside"],"Very High":["Stay indoors as much as possible","Keep windows and doors closed","Use air conditioning","Take allergy medication as prescribed","Wear a mask if going outside"]},L=`
                <div class="forecast-result">
                    <h3>Your Personalized Pollen Forecast</h3>
                    <div class="pollen-level">
                        <span class="level ${u.toLowerCase().replace(" ","-")}" style="background-color: ${h}">
                            ${u}
                        </span>
                        <p>Pollen levels are <strong>${u.toLowerCase()}</strong> in your area today.</p>
                        <p class="location">Location: ${a.toFixed(4)}°N, ${l.toFixed(4)}°W</p>
                    </div>
                    <div class="recommendations">
                        <h4>Recommendations:</h4>
                        <ul>
                            ${w[u].map(p=>`<li>${p}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="forecast-actions">
                        <button id="refreshForecast" class="btn">
                            <i class="fas fa-sync-alt"></i> Refresh Forecast
                        </button>
                        <button id="closeForecast" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            `;t.innerHTML=L,f.forecastDataLoaded=!0,console.log("Forecast data loaded successfully");const m=document.getElementById("refreshForecast"),g=document.getElementById("closeForecast");m&&m.addEventListener("click",s),g&&g.addEventListener("click",n)}catch(i){console.error("Error loading forecast data:",i);let a="We couldn't load your personalized forecast. This might be due to network issues or location services being disabled.";i.code===i.PERMISSION_DENIED&&(a="We need your location to provide accurate pollen forecasts. Please enable location services and try again.");const l=`
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h4>Unable to Load Forecast</h4>
                    <p>${a}</p>
                    <button class="primary-btn" id="retryButton" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;t.innerHTML=l,requestAnimationFrame(()=>{const c=document.getElementById("retryButton");c&&(c.removeEventListener("click",s),c.addEventListener("click",s))})}}function y(){return new Promise((i,a)=>{if(!navigator.geolocation){a(new Error("Geolocation is not supported by your browser"));return}const l={enableHighAccuracy:!0,timeout:1e4,maximumAge:0};navigator.geolocation.getCurrentPosition(i,a,l)})}r()});
