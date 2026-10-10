/**
 * i18n configuration and labels provider
 *
 * This module provides a centralized way to manage user-facing strings in the scheduler.
 * Users can provide localized labels either through the config or by setting a custom
 * labels provider function.
 */

// Default English labels
export type LabelKey = 'resourceName' | 'taskName' | 'agendaViewHeader' | 'weekNumberLabel';
type Labels = Record<LabelKey, string>;
export type LabelsProvider = ((key: LabelKey, locale?: string) => string | undefined | null) | Partial<Labels>;

const defaultLabels: Labels = {
  resourceName: 'Resource Name',
  taskName: 'Task Name',
  agendaViewHeader: 'Agenda',
  weekNumberLabel: 'Week No.',
};

// Current labels provider (can be a function or object)
let labelsProvider: LabelsProvider | null = null;

/**
 * Get the current label for a given key
 */
export function getLabel(key: LabelKey, locale?: string): string {
  // If a custom provider function is set, use it
  if (typeof labelsProvider === 'function') {
    const label = labelsProvider(key, locale);
    return label ?? defaultLabels[key];
  }

  // If a labels object provider is set, use it with fallback
  if (labelsProvider && typeof labelsProvider === 'object') {
    const label = labelsProvider[key];
    return label ?? defaultLabels[key];
  }

  // Fall back to default English labels
  return defaultLabels[key];
}

/**
 * Set a custom labels provider
 */
export function setLabelsProvider(provider: LabelsProvider | null): void {
  labelsProvider = provider;
}

/**
 * Get all default labels
 */
export function getDefaultLabels(): Labels {
  return { ...defaultLabels };
}

/**
 * Reset to default English labels
 */
export function resetLabelsProvider(): void {
  labelsProvider = null;
}
