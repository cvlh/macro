'use strict';
import Simulate from './simulate.js';

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

let vw = window.innerWidth * 0.01;
document.documentElement.style.setProperty('--vw', `${vw}px`);

let simulateDiv = document.getElementById('simulate');
simulateDiv.style.height = 'calc(var(--vh, 1vh) * 100)';
simulateDiv.style.width  = 'calc(var(--vw, 1vh) * 100)';

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vw', `${vw}px`);
});

let simulate = new Simulate();

let container = simulate.getFragment(false);
container.style.height = '100%';
container.style.display = 'flex';
container.style.flexDirection = 'column';

simulateDiv.appendChild(container);

// let main_div = container.querySelector('main');
// main_div.style.border = 'none';
// main_div.style.borderRadius = 'none';

fetch('../../../macro_simple.json')
    .then(function(response) {
        if(response.ok) {
            response.json().then(data => { simulate.start(data); });
        } else {
            console.log('Network response was not ok.');
        }
    })
    .catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
    }
);
