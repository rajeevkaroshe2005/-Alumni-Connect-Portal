import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { StudentDashboard } from './StudentDashboard'
import { AlumniDashboard } from './AlumniDashboard'
import { AdminDashboard } from '../admin/AdminDashboard'

export const DashboardRouter = () => {
  const { role } = useAuth()

  if (role === 'ADMIN') {
    return <AdminDashboard />
  }

  if (role === 'ALUMNI') {
    return <AlumniDashboard />
  }

  return <StudentDashboard />
}
