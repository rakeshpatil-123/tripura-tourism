export const COLORS = {

// Base Colors

PRIMARY: {

background: 'hsl(219, 43%, 96%)', // #eff3f9 - Main background

card: 'hsl(0, 0%, 100%)', // #ffffff - Card background

surface: 'hsl(220, 25%, 98%)', // Light surface for subtle sections

},



// Brand & Accent Colors

BRAND: {

primary: 'hsl(220, 85%, 52%)', // Modern blue for primary actions

secondary: 'hsl(220, 70%, 60%)', // Lighter blue for secondary elements

accent: 'hsl(210, 100%, 45%)', // Vibrant blue for highlights

light: 'hsl(220, 100%, 95%)', // Very light blue for hover states

},



// Semantic Colors

SEMANTIC: {

success: 'hsl(142, 76%, 45%)', // Green for success states

warning: 'hsl(45, 100%, 55%)', // Amber for warnings

error: 'hsl(0, 84%, 60%)', // Red for errors

info: 'hsl(200, 100%, 50%)', // Cyan for information

},



// Text Colors

TEXT: {

primary: 'hsl(220, 15%, 25%)', // Dark blue-gray for main text

secondary: 'hsl(220, 10%, 50%)', // Medium gray for secondary text

muted: 'hsl(220, 8%, 65%)', // Light gray for muted text

inverse: 'hsl(0, 0%, 100%)', // White text for dark backgrounds

link: 'hsl(220, 85%, 52%)', // Blue for links

linkHover: 'hsl(220, 85%, 40%)', // Darker blue for link hover

},



// Button Colors

BUTTON: {

// Primary Button

primaryBg: 'hsl(220, 85%, 52%)',

primaryHover: 'hsl(220, 85%, 45%)',

primaryActive: 'hsl(220, 85%, 40%)',

primaryText: 'hsl(0, 0%, 100%)',


// Secondary Button

secondaryBg: 'hsl(220, 25%, 98%)',

secondaryHover: 'hsl(220, 25%, 94%)',

secondaryActive: 'hsl(220, 25%, 88%)',

secondaryText: 'hsl(220, 85%, 52%)',

secondaryBorder: 'hsl(220, 85%, 52%)',


// Outline Button

outlineBg: 'transparent',

outlineHover: 'hsl(220, 100%, 98%)',

outlineActive: 'hsl(220, 100%, 95%)',

outlineText: 'hsl(220, 85%, 52%)',

outlineBorder: 'hsl(220, 85%, 52%)',


// Ghost Button

ghostBg: 'transparent',

ghostHover: 'hsl(220, 100%, 98%)',

ghostActive: 'hsl(220, 100%, 95%)',

ghostText: 'hsl(220, 85%, 52%)',


// Danger Button

dangerBg: 'hsl(0, 84%, 60%)',

dangerHover: 'hsl(0, 84%, 55%)',

dangerActive: 'hsl(0, 84%, 50%)',

dangerText: 'hsl(0, 0%, 100%)',

},



// Border Colors

BORDER: {

light: 'hsl(220, 15%, 90%)', // Light borders

medium: 'hsl(220, 15%, 80%)', // Medium borders

dark: 'hsl(220, 15%, 70%)', // Dark borders

focus: 'hsl(220, 85%, 52%)', // Focus ring color

},



// Form Colors

FORM: {

inputBg: 'hsl(0, 0%, 100%)',

inputBorder: 'hsl(220, 15%, 85%)',

inputBorderHover: 'hsl(220, 15%, 75%)',

inputBorderFocus: 'hsl(220, 85%, 52%)',

inputText: 'hsl(220, 15%, 25%)',

inputPlaceholder: 'hsl(220, 10%, 60%)',


// Validation states

inputSuccess: 'hsl(142, 76%, 45%)',

inputWarning: 'hsl(45, 100%, 55%)',

inputError: 'hsl(0, 84%, 60%)',

},



// Navigation Colors

NAV: {

bg: 'hsl(0, 0%, 100%)',

border: 'hsl(220, 15%, 90%)',

linkText: 'hsl(220, 15%, 40%)',

linkHover: 'hsl(220, 85%, 52%)',

linkActive: 'hsl(220, 85%, 52%)',

linkActiveBg: 'hsl(220, 100%, 97%)',

},



// Table Colors

TABLE: {

headerBg: 'hsl(220, 25%, 98%)',

headerText: 'hsl(220, 15%, 25%)',

rowEven: 'hsl(0, 0%, 100%)',

rowOdd: 'hsl(220, 43%, 99%)',

rowHover: 'hsl(220, 100%, 98%)',

border: 'hsl(220, 15%, 90%)',

},



// Status Colors

STATUS: {

// Active/Online

online: 'hsl(142, 76%, 45%)',


// Pending/Processing

pending: 'hsl(45, 100%, 55%)',


// Inactive/Offline

offline: 'hsl(220, 10%, 60%)',


// Draft

draft: 'hsl(220, 85%, 52%)',

},



// Shadow Colors

SHADOW: {

light: 'hsla(220, 15%, 0%, 0.05)',

medium: 'hsla(220, 15%, 0%, 0.1)',

dark: 'hsla(220, 15%, 0%, 0.15)',

focus: 'hsla(220, 85%, 52%, 0.25)',

},



// Overlay Colors

OVERLAY: {

light: 'hsla(220, 15%, 0%, 0.3)',

medium: 'hsla(220, 15%, 0%, 0.5)',

dark: 'hsla(220, 15%, 0%, 0.7)',

},



// Notification Colors

NOTIFICATION: {

successBg: 'hsl(142, 76%, 95%)',

successBorder: 'hsl(142, 76%, 45%)',

successText: 'hsl(142, 76%, 30%)',


warningBg: 'hsl(45, 100%, 95%)',

warningBorder: 'hsl(45, 100%, 55%)',

warningText: 'hsl(45, 100%, 35%)',


errorBg: 'hsl(0, 84%, 95%)',

errorBorder: 'hsl(0, 84%, 60%)',

errorText: 'hsl(0, 84%, 40%)',


infoBg: 'hsl(200, 100%, 95%)',

infoBorder: 'hsl(200, 100%, 50%)',

infoText: 'hsl(200, 100%, 35%)',

},



// Utility Colors

UTILITY: {

disabled: 'hsl(220, 10%, 85%)',

disabledText: 'hsl(220, 10%, 60%)',

backdrop: 'hsla(220, 15%, 0%, 0.4)',

selection: 'hsla(220, 85%, 52%, 0.2)',

}

};





// CSS Custom Properties (CSS Variables) for use in stylesheets

export const CSS_VARIABLES = `

:root {

/* Base Colors */

--color-primary: ${COLORS.PRIMARY.background};

--color-primary: ${COLORS.PRIMARY.card};

--color-primary: ${COLORS.PRIMARY.surface};


/* Brand Colors */

--color-tertiary: ${COLORS.BRAND.primary};

--color-tertiary: ${COLORS.BRAND.secondary};

--color-tertiary-shade: ${COLORS.BRAND.accent};

--color-tertiary-shade: ${COLORS.BRAND.light};


/* Text Colors */

--color-text-dark: ${COLORS.TEXT.primary};

--color-text-medium: ${COLORS.TEXT.secondary};

--color-text-light: ${COLORS.TEXT.muted};

--color-text-white: ${COLORS.TEXT.inverse};

--color-text-link: ${COLORS.TEXT.link};

--color-text-link-hover: ${COLORS.TEXT.linkHover};


/* Button Colors */

--color-tertiary: ${COLORS.BUTTON.primaryBg};

--color-tertiary-shade: ${COLORS.BUTTON.primaryHover};

--color-btn-primary-text: ${COLORS.BUTTON.primaryText};

--color-secondary: ${COLORS.BUTTON.secondaryBg};

--color-secondary-shade: ${COLORS.BUTTON.secondaryHover};

--color-btn-secondary-text: ${COLORS.BUTTON.secondaryText};


/* Border Colors */

--color-border-light: ${COLORS.BORDER.light};

--color-border-medium: ${COLORS.BORDER.medium};

--color-border-focus: ${COLORS.BORDER.focus};


/* Semantic Colors */

--color-poppy-green: ${COLORS.SEMANTIC.success};

--color-poppy-yellow: ${COLORS.SEMANTIC.warning};

--color-poppy-red: ${COLORS.SEMANTIC.error};

--color-poppy-blue: ${COLORS.SEMANTIC.info};


/* Shadow Colors */

--shadow-light: ${COLORS.SHADOW.light};

--shadow-medium: ${COLORS.SHADOW.medium};

--shadow-focus: ${COLORS.SHADOW.focus};

}

`;