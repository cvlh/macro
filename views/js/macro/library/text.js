'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'text',
    label: _I18N_.input_blocks_text,
    icon: 'text',
    defaultProps: {
        type: 'text'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'text',
        macroContext,
        dropPosition
    })
});
