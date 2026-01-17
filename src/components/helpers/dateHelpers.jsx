import { format, parse, addDays, addWeeks, addMonths, addYears, startOfMonth, endOfMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';

export function getLocalDate() {
  const now = new Date();
  return format(now, 'yyyy-MM-dd');
}

export function getLocalMonth() {
  return format(new Date(), 'yyyy-MM');
}

export function formatMonthYear(dateStr) {
  const date = parse(dateStr, 'yyyy-MM', new Date());
  return format(date, 'MMMM yyyy');
}

export function isDueToday(dueDate) {
  const today = getLocalDate();
  return dueDate === today;
}

export function getAllDueDatesForMonth(template, monthStr) {
  const dueDates = [];
  const monthStart = startOfMonth(parse(monthStr, 'yyyy-MM', new Date()));
  const monthEnd = endOfMonth(monthStart);
  const firstDue = parseISO(template.firstDueDate);

  if (template.scheduleType === 'one_time') {
    if (isWithinInterval(firstDue, { start: monthStart, end: monthEnd })) {
      dueDates.push(format(firstDue, 'yyyy-MM-dd'));
    }
    return dueDates;
  }

  if (template.scheduleType === 'recurring' || template.scheduleType === 'payment_plan') {
    let currentDate = firstDue;
    let count = 0;
    const maxOccurrences = template.scheduleType === 'payment_plan' ? template.planCountTotal : 1000;

    while (currentDate <= monthEnd && count < maxOccurrences) {
      if (currentDate >= monthStart) {
        dueDates.push(format(currentDate, 'yyyy-MM-dd'));
      }
      
      count++;
      if (count >= maxOccurrences) break;

      switch (template.frequency) {
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'every_2_weeks':
          currentDate = addWeeks(currentDate, 2);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'every_3_months':
          currentDate = addMonths(currentDate, 3);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, 1);
          break;
        default:
          return dueDates;
      }
    }
  }

  return dueDates;
}

export function getNextDueDateFromNow(template, paymentRecords) {
  const today = new Date();
  const firstDue = parseISO(template.firstDueDate);
  
  if (template.scheduleType === 'one_time') {
    const isPaid = paymentRecords.some(p => p.dueDate === template.firstDueDate);
    return isPaid ? null : template.firstDueDate;
  }

  let currentDate = firstDue;
  let count = 0;
  const maxOccurrences = template.scheduleType === 'payment_plan' ? template.planCountTotal : 1000;

  while (count < maxOccurrences) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const isPaid = paymentRecords.some(p => p.dueDate === dateStr);
    
    if (currentDate >= today && !isPaid) {
      return dateStr;
    }

    count++;
    if (count >= maxOccurrences) break;

    switch (template.frequency) {
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'every_2_weeks':
        currentDate = addWeeks(currentDate, 2);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'every_3_months':
        currentDate = addMonths(currentDate, 3);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, 1);
        break;
      default:
        return null;
    }
  }

  return null;
}

export function getFrequencyLabel(template) {
  if (template.scheduleType === 'one_time') return 'One time';
  if (template.scheduleType === 'payment_plan') {
    const freq = template.frequency === 'monthly' ? 'Monthly' : 'Every 2 weeks';
    return `${freq} (${template.planCountRemaining} left)`;
  }
  
  switch (template.frequency) {
    case 'weekly': return 'Weekly';
    case 'every_2_weeks': return 'Every 2 weeks';
    case 'monthly': return 'Monthly';
    case 'every_3_months': return 'Every 3 months';
    case 'yearly': return 'Yearly';
    default: return '';
  }
}