import React from 'react'
import QRGenerator from '../Attendance/QRGenerator'
import QRScanner from '../Attendance/QRScanner'

const UserDashboard = () => {
  return (
    <div>
        <QRGenerator />
        <QRScanner />
    </div>
  )
}

export default UserDashboard