'use strict';

const ICONS = {
    text: '<path d="M4 5h16v2h-7v12h-2V7H4z"></path>',
    number: '<path d="M6 5h2l-1 5h3l1-5h2l-1 5h3l1-5h2l-1 5h3v2h-4l-1 4h3v2h-4l-1 5h-2l1-5h-3l-1 5h-2l1-5H7l-1 5H4l1-5H2v-2h4l1-4H4v-2h4l1-5zm3 11h3l1-4h-3z"></path>',
    email: '<path d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm9 6.8L20 8H4zm0 2.2L4 9.8V17h16V9.8z"></path>',
    date: '<path d="M7 2h2v3h6V2h2v3h3a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h3zm12 8H5v10h14z"></path>',
    time: '<path d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20zm1 5h-2v6l5 3l1-1.7l-4-2.3z"></path>',
    photo: '<path d="M5 4h3l2-2h4l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm7 4a5 5 0 1 0 0 10a5 5 0 0 0 0-10z"></path>',
    signature: '<path d="M3 17c1.2-2 2.7-3 4.2-3c2.3 0 2.9 2 4.8 2c1.2 0 2.2-.5 3.4-1.5l2.8-2.6c1.1-1 2.3-1.5 3.8-1.5v2c-1 0-1.8.3-2.5.9l-2.8 2.6c-1.5 1.4-3 2.1-4.7 2.1c-2.5 0-3.3-2-4.8-2c-.9 0-1.9.7-2.9 2z"></path>',
    scan: '<path d="M4 7V4h3V2H2v5zm13-5v2h3v3h2V2zM4 17H2v5h5v-2H4zm18 0h-2v3h-3v2h5zM7 11h10v2H7z"></path>',
    fallback: '<circle cx="12" cy="12" r="7"></circle>'
};

const toIconMarkup = iconName => ICONS[iconName] || ICONS.fallback;

export const createLibraryButton = component => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'library-item';
    button.dataset.componentId = component.id;
    button.dataset.componentGroup = component.group;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList.add('library-item-icon');
    icon.innerHTML = toIconMarkup(component.icon);

    const label = document.createElement('span');
    label.className = 'library-item-label';
    label.textContent = component.label;

    button.appendChild(icon);
    button.appendChild(label);

    return button;
};

export const createLibraryComponent = ({
    id,
    label,
    group = 'Input',
    icon = 'fallback',
    defaultProps = {},
    onDrop = () => null
}) => ({
    id,
    label,
    group,
    icon,
    defaultProps: { ...defaultProps },
    createButton() {
        return createLibraryButton(this);
    },
    onDrop
});
