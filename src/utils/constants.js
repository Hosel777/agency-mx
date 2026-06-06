export const REQUEST_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  review: 'En revisión',
  approved: 'Aprobado',
  completed: 'Completado',
  rejected: 'Rechazado',
}

export const STATUS_COLORS = {
  pending: 'badge-yellow',
  in_progress: 'badge-blue',
  review: 'badge-purple',
  approved: 'badge-green',
  completed: 'badge-green',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
}
