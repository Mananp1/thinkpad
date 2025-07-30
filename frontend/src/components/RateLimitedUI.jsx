
import { OctagonAlert } from 'lucide-react'
import React from 'react'

const RateLimitedUI = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='bg-secondary/10 border-solid border-secondary/20 border-2 rounded-lg'>
            <div className='flex flex-col md:flex-row items-center p-6'>
                <div className='flex-shrink-0 bg-secondary/20 p-4 rounded-full mb-4 md:mb-0 md:mr-6'>
                    <OctagonAlert />
                </div>
                <div className='flex-1 text-center md:text-left'>
                    <h3 className='text-xl font-bold mb-2'>Rate limit Reached</h3>
                    <p className='text-base-content mb-1'>You have made too many requests in a short period. Please wait a moment.</p>
                    <p className='text-sm text-base-content/70'>Try again in a few seconds for the best experience.</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RateLimitedUI