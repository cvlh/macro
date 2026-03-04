'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'email',
    label: _I18N_.input_blocks_email,
    icon: 'email',
    defaultProps: {
        type: 'email'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'email',
        macroContext,
        dropPosition
    })
});
