import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  es: {
    'nav.dashboard': 'Dashboard',
    'nav.newRequest': 'Nueva Solicitud',
    'nav.kanban': 'Kanban',
    'nav.agents': 'Agentes',
    'nav.approvals': 'Aprobaciones',
    'nav.settings': 'Configuración',
    'nav.login': 'Iniciar sesión',
    'header.search': 'Buscar...',
    'header.notifications': 'Notificaciones',
    'header.markAllRead': 'Marcar todo leído',
    'header.noNotifs': 'Sin notificaciones',
    'header.lightMode': 'Modo claro',
    'header.darkMode': 'Modo oscuro',
    'header.logout': 'Cerrar sesión',
    'demo.button': 'Demo Rápida ⚡',
    'demo.creating': 'Creando demo...',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.newRequest': 'New Request',
    'nav.kanban': 'Kanban',
    'nav.agents': 'Agents',
    'nav.approvals': 'Approvals',
    'nav.settings': 'Settings',
    'nav.login': 'Sign In',
    'header.search': 'Search...',
    'header.notifications': 'Notifications',
    'header.markAllRead': 'Mark all read',
    'header.noNotifs': 'No notifications',
    'header.lightMode': 'Light mode',
    'header.darkMode': 'Dark mode',
    'header.logout': 'Log out',
    'demo.button': 'Quick Demo ⚡',
    'demo.creating': 'Creating demo...',
  },
  pt: {
    'nav.dashboard': 'Painel',
    'nav.newRequest': 'Nova Solicitação',
    'nav.kanban': 'Kanban',
    'nav.agents': 'Agentes',
    'nav.approvals': 'Aprovações',
    'nav.settings': 'Configurações',
    'nav.login': 'Entrar',
    'header.search': 'Pesquisar...',
    'header.notifications': 'Notificações',
    'header.markAllRead': 'Marcar tudo lido',
    'header.noNotifs': 'Sem notificações',
    'header.lightMode': 'Modo claro',
    'header.darkMode': 'Modo escuro',
    'header.logout': 'Sair',
    'demo.button': 'Demo Rápida ⚡',
    'demo.creating': 'Criando demo...',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.newRequest': 'Nouvelle demande',
    'nav.kanban': 'Kanban',
    'nav.agents': 'Agents',
    'nav.approvals': 'Approbations',
    'nav.settings': 'Paramètres',
    'nav.login': 'Connexion',
    'header.search': 'Rechercher...',
    'header.notifications': 'Notifications',
    'header.markAllRead': 'Tout marquer lu',
    'header.noNotifs': 'Aucune notification',
    'header.lightMode': 'Mode clair',
    'header.darkMode': 'Mode sombre',
    'header.logout': 'Déconnexion',
    'demo.button': 'Démo rapide ⚡',
    'demo.creating': 'Création de la démo...',
  },
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try { return localStorage.getItem('agency-mx-locale') || 'es' } catch { return 'es' }
  })

  const t = useCallback((key) => {
    return translations[locale]?.[key] || translations.es[key] || key
  }, [locale])

  const changeLocale = useCallback((l) => {
    setLocale(l)
    try { localStorage.setItem('agency-mx-locale', l) } catch {}
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
export const LOCALES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]
