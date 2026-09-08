import { assetUrl } from './assetUrl'

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

export function getNotificationPermission(): PermissionState {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission as PermissionState
}

/** Запрашиваем только по явному действию пользователя, не при входе на сайт. */
export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof Notification === 'undefined') return 'unsupported'
  try {
    return (await Notification.requestPermission()) as PermissionState
  } catch {
    return 'denied'
  }
}

/**
 * Показывает уведомление. Через Service Worker надёжнее (работает на другой
 * вкладке и в мобильном Chrome), обычный Notification — как резервный путь.
 */
export async function showAppNotification(title: string, body: string): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') return false

  const options: NotificationOptions = {
    body,
    icon: assetUrl('icons/logo.png'),
    badge: assetUrl('icons/logo.png'),
    tag: 'dobratimia-pomodoro',
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, options)
      return true
    } catch {
      // Падаем на обычное уведомление ниже.
    }
  }

  try {
    new Notification(title, options)
    return true
  } catch {
    return false
  }
}

export const NOTIFICATION_DENIED_HINT =
  'Уведомления заблокированы. Включите их для сайта в настройках браузера: значок замка в адресной строке → «Уведомления» → «Разрешить».'
