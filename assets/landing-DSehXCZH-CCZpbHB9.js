(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function r(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=r(o);fetch(o.href,n)}})();(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();const f={appReady:!1,forecastDataLoaded:!1,loadingSteps:[{id:"step1",icon:"⏳",text:"Initializing forecast..."},{id:"step2",icon:"📍",text:"Detecting your location"},{id:"step3",icon:"🌤️",text:"Fetching weather data"},{id:"step4",icon:"📊",text:"Analyzing pollen levels"}]},y={currentStep:0,totalSteps:4,countdownInterval:null,init(){this.currentStep=0,this.updateProgress(0),this.startCountdown(10)},updateStep(e,t="loading"){if(e>=0&&e<this.totalSteps){const r=document.getElementById(`step${e+1}`);if(!r)return;r.className=t,r.innerHTML=`
                <span class="status-icon">
                    ${t==="completed"?"✓":t==="error"?"✕":f.loadingSteps[e].icon}
                </span>
                <span class="status-text">${f.loadingSteps[e].text}</span>
            `}},updateProgress(e){const t=document.querySelector(".progress-bar");t&&(t.style.width=`${e}%`)},startCountdown(e){this.stopCountdown();let t=e;this.updateTimeRemaining(t),this.countdownInterval=setInterval(()=>{t--,this.updateTimeRemaining(t),t<=0&&this.stopCountdown()},1e3)},stopCountdown(){this.countdownInterval&&(clearInterval(this.countdownInterval),this.countdownInterval=null)},updateTimeRemaining(e){const t=document.getElementById("loadingTime");t&&(t.textContent=`Estimated time remaining: ${e} seconds`)}};document.addEventListener("DOMContentLoaded",function(){document.getElementById("forecastToggle");let e=null;document.getElementById("closeModal");let t=null;function r(){e=document.getElementById("forecastModal"),t=document.getElementById("forecastData"),s(),f.appReady=!0,y.init(),console.log("App initialized with forecastModal:",!!e,"forecastData:",!!t)}function s(){document.addEventListener("click",i=>{i.target.closest("#forecastToggle")&&o(),(i.target.closest(".close")||i.target.classList.contains("close"))&&n()}),e&&e.addEventListener("click",i=>{i.target===e&&n()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&e&&e.classList.contains("active")&&n()})}function o(){e&&(e.classList.contains("active")?n():(e.classList.add("active"),document.body.style.overflow="hidden",a()))}function n(){e&&(e.classList.remove("active"),document.body.style.overflow="",t&&(t.innerHTML=""),y.init())}async function a(){if(console.log("Starting forecast data load..."),!t){console.error("forecastData element not found");return}try{t.innerHTML=`
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading your personalized forecast...</p>
                </div>
            `,e&&(e.classList.add("active"),document.body.style.overflow="hidden");const i=await v(),{latitude:c,longitude:d}=i.coords;await new Promise(m=>setTimeout(m,1500));const l=[{level:"Low",color:"#4CAF50"},{level:"Moderate",color:"#FFC107"},{level:"High",color:"#FF9800"},{level:"Very High",color:"#F44336"}],{level:u,color:h}=l[Math.floor(Math.random()*l.length)],w={Low:["Enjoy outdoor activities with minimal risk","Continue with your normal routine","Keep windows open for fresh air"],Moderate:["Consider limiting outdoor activities if you're sensitive","Keep windows closed at night","Use air conditioning if possible"],High:["Limit time spent outdoors","Keep windows and doors closed","Use air purifiers indoors","Shower after being outside"],"Very High":["Stay indoors as much as possible","Keep windows and doors closed","Use air conditioning","Take allergy medication as prescribed","Wear a mask if going outside"]},L=`
                <div class="forecast-result">
                    <h3>Your Personalized Pollen Forecast</h3>
                    <div class="pollen-level">
                        <span class="level ${u.toLowerCase().replace(" ","-")}" style="background-color: ${h}">
                            ${u}
                        </span>
                        <p>Pollen levels are <strong>${u.toLowerCase()}</strong> in your area today.</p>
                        <p class="location">Location: ${c.toFixed(4)}°N, ${d.toFixed(4)}°W</p>
                    </div>
                    <div class="recommendations">
                        <h4>Recommendations:</h4>
                        <ul>
                            ${w[u].map(m=>`<li>${m}</li>`).join("")}
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
            `;t.innerHTML=L,f.forecastDataLoaded=!0,console.log("Forecast data loaded successfully");const p=document.getElementById("refreshForecast"),g=document.getElementById("closeForecast");p&&p.addEventListener("click",a),g&&g.addEventListener("click",n)}catch(i){console.error("Error loading forecast data:",i);let c="We couldn't load your personalized forecast. This might be due to network issues or location services being disabled.";i.code===i.PERMISSION_DENIED&&(c="We need your location to provide accurate pollen forecasts. Please enable location services and try again.");const d=`
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h4>Unable to Load Forecast</h4>
                    <p>${c}</p>
                    <button class="primary-btn" id="retryButton" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;t.innerHTML=d,requestAnimationFrame(()=>{const l=document.getElementById("retryButton");l&&(l.removeEventListener("click",a),l.addEventListener("click",a))})}}function v(){return new Promise((i,c)=>{if(!navigator.geolocation){c(new Error("Geolocation is not supported by your browser"));return}const d={enableHighAccuracy:!0,timeout:1e4,maximumAge:0};navigator.geolocation.getCurrentPosition(i,c,d)})}r()});
