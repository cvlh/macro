'use strict';
import Simulate from './simulate.js';
            
let simulateDiv = document.getElementById('simulate');
simulateDiv.style.height = '100vh';
simulateDiv.style.width = '100vw';

let simulate = new Simulate();

let container = simulate.getFragment(false);
container.style.height = '100%';
container.style.display = 'flex';
container.style.flexDirection = 'column';

simulateDiv.appendChild(container);

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
