'use strict';

export default function InputState() {

    if (!new.target) 
        throw new Error('InputState() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let current, list;

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.isFirst = () => current === 0 && list.length > 1;
    this.hasMore = () => current < list.length;

    this.push = input => list.push(input);

    this.setCurrent = value => current = value;
    this.incCurrent = () => current++;

    this.getInput = () => {
        if (current < list.length)
            return list[current]['_input_'];
        return null;
    };
    this.getPrevInput = () => {
        if (current > 0)
            return list[current - 1]['_input_'];
        return null;
    };

    this.getElement = () => {
        if (current < list.length)
            return list[current];
        return null;
    };
    this.getPrevElement = () => {
        if (current > 0)
            return list[current - 1];
        return null;
    };

    this.clear = () => {
        current = 0;

        while (list.length) {
            const item = list.pop();

            delete item['_props_'];
            delete item['_input_'];
        }
        list = [];
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function init ()  {
        current = 0;
        list = [];
    })();
}