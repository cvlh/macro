'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'date',
    label: _I18N_.input_blocks_date,
    icon: 'date',
    defaultProps: {
        type: 'date'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'date',
        macroContext,
        dropPosition
    })
});
