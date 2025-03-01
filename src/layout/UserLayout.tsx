import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { useState } from 'react'

const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        userType={'customer'}
        // role={'user'}
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1">
        <Header isSidebarOpen={isSidebarOpen} />
        <main className="pt-16 p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserLayout
