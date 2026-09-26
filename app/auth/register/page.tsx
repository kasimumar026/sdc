import React from 'react'
import RegisterClient from './RegisterClient'

function Register() {
  return (
   <div className="bg-primary flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RegisterClient />
      </div>
    </div>
  )
}

export default Register