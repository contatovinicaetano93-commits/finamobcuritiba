import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { AreaPage } from '@/pages/AreaPage'
import { ContactPage } from '@/pages/ContactPage'
import { DirectConDownloadPage } from '@/pages/DirectConDownloadPage'
import { FarejadorPage } from '@/pages/FarejadorPage'
import { FolderPage } from '@/pages/FolderPage'
import { HomePage } from '@/pages/HomePage'
import { IncorporadorPage } from '@/pages/IncorporadorPage'
import { ParceiroPage } from '@/pages/ParceiroPage'
import { SolutionsPage } from '@/pages/SolutionsPage'

function HashScroll() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) {
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname])

  return null
}

export default function App() {
  return (
    <div className="flex min-h-svh flex-col bg-[#050505]">
      <HashScroll />
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solucoes" element={<SolutionsPage />} />
          <Route path="/area" element={<AreaPage />} />
          <Route path="/areas" element={<Navigate to="/area" replace />} />
          <Route path="/incorporador" element={<IncorporadorPage />} />
          <Route path="/parceiro" element={<ParceiroPage />} />
          <Route path="/farejador" element={<FarejadorPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/folder" element={<FolderPage />} />
          <Route path="/baixar-directcon" element={<DirectConDownloadPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}
