(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))c(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&c(r)}).observe(document,{childList:!0,subtree:!0});function s(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function c(o){if(o.ep)return;o.ep=!0;const i=s(o);fetch(o.href,i)}})();const d={appReady:!1,forecastDataLoaded:!1,loadingSteps:[{id:"step1",icon:"⏳",text:"Initializing forecast..."},{id:"step2",icon:"📍",text:"Detecting your location"},{id:"step3",icon:"🌤️",text:"Fetching weather data"},{id:"step4",icon:"📊",text:"Analyzing pollen levels"}]},f={currentStep:0,totalSteps:4,countdownInterval:null,init(){this.currentStep=0,this.updateProgress(0),this.startCountdown(10)},updateStep(t,e="loading"){if(t>=0&&t<this.totalSteps){const s=document.getElementById(`step${t+1}`);if(!s)return;s.className=e,s.innerHTML=`
                <span class="status-icon">
                    ${e==="completed"?"✓":e==="error"?"✕":d.loadingSteps[t].icon}
                </span>
                <span class="status-text">${d.loadingSteps[t].text}</span>
            `}},updateProgress(t){const e=document.querySelector(".progress-bar");e&&(e.style.width=`${t}%`)},startCountdown(t){this.stopCountdown();let e=t;this.updateTimeRemaining(e),this.countdownInterval=setInterval(()=>{e--,this.updateTimeRemaining(e),e<=0&&this.stopCountdown()},1e3)},stopCountdown(){this.countdownInterval&&(clearInterval(this.countdownInterval),this.countdownInterval=null)},updateTimeRemaining(t){const e=document.getElementById("loadingTime");e&&(e.textContent=`Estimated time remaining: ${t} seconds`)}};document.addEventListener("DOMContentLoaded",function(){document.getElementById("forecastToggle");let t=null;document.getElementById("closeModal");let e=null;function s(){t=document.getElementById("forecastModal"),e=document.getElementById("forecastData"),c(),d.appReady=!0,f.init(),console.log("App initialized with forecastModal:",!!t,"forecastData:",!!e)}function c(){document.addEventListener("click",n=>{n.target.closest("#forecastToggle")&&o(),(n.target.closest(".close")||n.target.classList.contains("close"))&&i()}),t&&t.addEventListener("click",n=>{n.target===t&&i()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&t&&t.classList.contains("active")&&i()})}function o(){t&&(t.classList.contains("active")?i():(t.classList.add("active"),document.body.style.overflow="hidden",r()))}function i(){t&&(t.classList.remove("active"),document.body.style.overflow="",e&&(e.innerHTML=""),f.init())}async function r(){if(console.log("Starting forecast data load..."),!e){console.error("forecastData element not found");return}try{e.innerHTML=`
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading your personalized forecast...</p>
                </div>
            `,t&&(t.classList.add("active"),document.body.style.overflow="hidden"),await new Promise(n=>setTimeout(n,1e3));try{console.log("Requesting geolocation...");const n=await g(),{latitude:l,longitude:a}=n.coords;console.log("Got location:",{latitude:l,longitude:a}),e.innerHTML=`
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Analyzing pollen levels in your area...</p>
                    </div>
                `,await new Promise(v=>setTimeout(v,1500));const p=["Low","Moderate","High","Very High"],u=p[Math.floor(Math.random()*p.length)],m=`
                    <div class="forecast-result">
                        <h3>Your Personalized Pollen Forecast</h3>
                        <div class="pollen-level">
                            <span class="level ${u.toLowerCase().replace(" ","-")}">${u}</span>
                            <p>Pollen levels are ${u.toLowerCase()} in your area today.</p>
                        </div>
                        <div class="recommendations">
                            <h4>Recommendations:</h4>
                            <ul>
                                <li>Keep windows closed during peak pollen hours (10am-4pm)</li>
                                <li>Use air purifiers indoors</li>
                                <li>Shower after being outside to remove pollen</li>
                                <li>Consider taking antihistamines if symptoms are severe</li>
                                <li>Wear sunglasses to protect your eyes</li>
                            </ul>
                        </div>
                    </div>
                `;e.innerHTML=m,d.forecastDataLoaded=!0,console.log("Forecast data loaded successfully")}catch(n){throw console.error("Geolocation error:",n),new Error("We need your location to provide accurate pollen forecasts. Please enable location services and try again.")}}catch(n){console.error("Error loading forecast data:",n);const l=`
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h4>Unable to Load Forecast</h4>
                    <p>We couldn't load your personalized forecast. This might be due to network issues or location services being disabled.</p>
                    <button class="primary-btn" id="retryButton" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;e.innerHTML=l,requestAnimationFrame(()=>{const a=document.getElementById("retryButton");a&&(a.removeEventListener("click",r),a.addEventListener("click",r))})}}function g(){return new Promise((n,l)=>{if(!navigator.geolocation){l(new Error("Geolocation is not supported by your browser"));return}const a={enableHighAccuracy:!0,timeout:1e4,maximumAge:0};navigator.geolocation.getCurrentPosition(n,l,a)})}s()});
