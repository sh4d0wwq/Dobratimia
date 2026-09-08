import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { SiteAudioProvider } from '@/context/SiteAudioProvider'
import { ToastProvider } from '@/context/ToastContext'
import { AboutPage } from '@/features/about/AboutPage'
import { ContactsPage } from '@/features/contacts/ContactsPage'
import { DassPage } from '@/features/dass/DassPage'
import { PrivacyPage } from '@/features/legal/PrivacyPage'
import { StatsPage } from '@/features/stats/StatsPage'
import { GoodwordPage } from '@/features/goodword/GoodwordPage'
import { HomePage } from '@/features/home/HomePage'
import { MapPage } from '@/features/map/MapPage'
import { MoodPage } from '@/features/mood/MoodPage'
import { MeditationPage } from '@/features/meditation/MeditationPage'
import { PsychoeducationPage } from '@/features/psychoeducation/PsychoeducationPage'
import { ResourcesPage } from '@/features/resources/ResourcesPage'
import { ScreamPage } from '@/features/scream/ScreamPage'
import { TherapistsPage } from '@/features/therapists/TherapistsPage'
import { TechniquesPage } from '@/features/techniques/TechniquesPage'

export default function App() {
  return (
    <ToastProvider>
      <SiteAudioProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="scream" element={<ScreamPage />} />
              <Route path="dass" element={<DassPage />} />
              <Route path="meditation" element={<MeditationPage />} />
              <Route path="psychoeducation" element={<PsychoeducationPage />} />
              <Route path="techniques" element={<TechniquesPage />} />
              <Route path="goodword" element={<GoodwordPage />} />
              <Route path="therapists" element={<TherapistsPage />} />
              <Route path="mood" element={<MoodPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SiteAudioProvider>
    </ToastProvider>
  )
}
