'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'scan',
    label: _I18N_.input_blocks_scan,
    icon: 'scan',
    defaultProps: {
        type: 'scan'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'scan',
        macroContext,
        dropPosition
    })
});
