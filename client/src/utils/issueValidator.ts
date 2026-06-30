import type { SubmissionData } from '@/types/issue';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates all required fields before submission.
 * Returns an array of errors (empty = valid).
 */
export function validateIssueSubmission(data: Partial<SubmissionData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Issue title is required.' });
  } else if (data.title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters.' });
  }

  if (!data.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required.' });
  } else if (data.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters.' });
  }

  if (!data.category) {
    errors.push({ field: 'category', message: 'Category is required.' });
  }

  if (!data.severity) {
    errors.push({ field: 'severity', message: 'Severity is required.' });
  }

  if (!data.department) {
    errors.push({ field: 'department', message: 'Department is required.' });
  }

  if (!data.imageDataURL) {
    errors.push({ field: 'image', message: 'An image must be uploaded.' });
  }

  if (!data.location) {
    errors.push({ field: 'location', message: 'Location must be selected.' });
  } else {
    if (!data.location.latitude || !data.location.longitude) {
      errors.push({ field: 'location', message: 'Valid coordinates are required.' });
    }
  }

  return errors;
}
