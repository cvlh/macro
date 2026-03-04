'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'signature',
    label: _I18N_.input_blocks_signature,
    icon: 'signature',
    defaultProps: {
        type: 'signature'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'signature',
        macroContext,
        dropPosition
    })
});
