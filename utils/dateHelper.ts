import type { RecurrenceFrequency } from '../types';

export const calculateNextDueDate = (currentDueDate: string, frequency: RecurrenceFrequency): string => {
    const date = new Date(currentDueDate + 'T00:00:00'); // Ensure parsing as local date

    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            // This handles month-end correctly (e.g., Jan 31 -> Feb 28/29)
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date.toISOString().split('T')[0];
};
