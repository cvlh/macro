'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'time',
    label: _I18N_.input_blocks_time,
    icon: 'time',
    defaultProps: {
        type: 'time'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'time',
        macroContext,
        dropPosition
    })
});
