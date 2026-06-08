export const REQUEST_STATUS = {
  PENDING: 'pending',
  QUOTING: 'quoting',
  QUOTE_SENT: 'quote_sent',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  pending: 'Pendiente',
  quoting: 'Generando presupuesto',
  quote_sent: 'Presupuesto listo',
  in_progress: 'En progreso',
  review: 'En revisión',
  approved: 'Aprobado',
  completed: 'Completado',
  rejected: 'Rechazado',
}

export const STATUS_COLORS = {
  pending: 'badge-yellow',
  quoting: 'badge-purple',
  quote_sent: 'badge-blue',
  in_progress: 'badge-blue',
  review: 'badge-purple',
  approved: 'badge-green',
  completed: 'badge-green',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
}
