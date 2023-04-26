'use strict';

import { _RUN_ENVIRONMENT_ } from '../../utils/constants.js';
import { addElement } from '../../utils/functions.js';
import Simulate from './simulate.js';

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

let vw = window.innerWidth * 0.01;
document.documentElement.style.setProperty('--vw', `${vw}px`);

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vw', `${vw}px`);
});

const simulateDiv = addElement(document.body, 'div', 'simulate-mobile-content');
const simulate = new Simulate(_RUN_ENVIRONMENT_.MOBILE);

simulateDiv.appendChild(simulate.getFragment());

fetch('../macro_simple.json')
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
