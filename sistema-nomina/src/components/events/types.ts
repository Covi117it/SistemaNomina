export type EventType = 'payroll-pending' | 'pdf-dispatch' | 'payroll-completed' | 'general-reminder';
export type EventPriority = 'ALTA' | 'MEDIA' | 'BAJA';

export interface CalendarEventItem {
  id: string;
  dayNumber: number; // 11, 12, 13...
  dayOfWeek: 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SÁ' | 'DO';
  dateStr: string; // YYYY-MM-DD
  startTime: string; // "07:00"
  endTime: string; // "07:30"
  title: string;
  subtitle?: string;
  eventType: EventType;
  priority: EventPriority;
  description?: string;
  participants?: string[];
  attachmentName?: string;
  actionText?: string;
}
