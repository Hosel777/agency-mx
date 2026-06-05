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
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}
