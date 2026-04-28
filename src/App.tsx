import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import Today from './pages/Today'

const DayDetail = lazy(() => import('./pages/DayDetail'))
const AdminKeys = lazy(() => import('./pages/AdminKeys'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 },
  },
})

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Today />} />
              <Route path="day/:date" element={<DayDetail />} />
              <Route path="internal/admin/keys" element={<AdminKeys />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  )
}
