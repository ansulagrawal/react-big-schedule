/**
 * i18n configuration and labels provider
 *
 * This module provides a centralized way to manage user-facing strings in the scheduler.
 * Users can provide localized labels either through the config or by setting a custom
 * labels provider function.
 */

// Default English labels
const defaultLabels = {
  resourceName: 'Resource Name',
  taskName: 'Task Name',
  agendaViewHeader: 'Agenda',
  weekNumberLabel: 'Week No.',
};

// Current labels provider (can be a function or object)
let labelsProvider = null;

/**
 * Get the current label for a given key
 * @param {string} key - The label key (e.g., 'resourceName', 'taskName')
 * @param {string} locale - Optional locale code for locale-specific translations
 * @returns {string} The localized label or the default English label
 */
export function getLabel(key, locale = undefined) {
  // If a custom provider function is set, use it
  if (typeof labelsProvider === 'function') {
    const label = labelsProvider(key, locale);
    return label !== undefined && label !== null ? label : defaultLabels[key];
  }

  // If a labels object provider is set, use it with fallback
  if (labelsProvider && typeof labelsProvider === 'object') {
    const label = labelsProvider[key];
    return label !== undefined && label !== null ? label : defaultLabels[key];
  }

  // Fall back to default English labels
  return defaultLabels[key];
}

/**
 * Set a custom labels provider
 * @param {Function|Object} provider - Either a function(key, locale) -> string or an object with label key-value pairs
 */
export function setLabelsProvider(provider) {
  labelsProvider = provider;
}

/**
 * Get all default labels
 * @returns {Object} Object with all default English labels
 */
export function getDefaultLabels() {
  return { ...defaultLabels };
}

/**
 * Reset to default English labels
 */
export function resetLabelsProvider() {
  labelsProvider = null;
}
