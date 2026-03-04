'use strict';

import { _I18N_ } from '../../i18n/pt-br.js';
import { createLibraryComponent } from './helpers.js';

export default createLibraryComponent({
    id: 'photo',
    label: _I18N_.input_blocks_photo,
    icon: 'photo',
    defaultProps: {
        type: 'photo'
    },
    onDrop: (macroContext, dropPosition) => ({
        componentId: 'photo',
        macroContext,
        dropPosition
    })
});
