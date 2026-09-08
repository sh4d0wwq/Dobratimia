import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SosFab } from './SosFab'
import { TopNav } from './TopNav'
import { ReminderBanner } from './ReminderBanner'
import { Toast } from './Toast'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-col pb-20 lg:pb-0">
        <Header />
        <TopNav />
        <main className="animate-fade-in mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">
          <ReminderBanner />
          <Outlet />
        </main>
        <Footer />
        <BottomNav />
        <SosFab />
        <Toast />
      </div>
    </div>
  )
}
