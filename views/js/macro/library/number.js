'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'number',
    label: _I18N_.input_blocks_number,
    icon: 'number',
    defaultProps: {
        type: 'number'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'number',
        macroContext,
        dropPosition
    })
});
