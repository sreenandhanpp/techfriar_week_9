import React from 'react'
import './style.css'

const ErrAlert = ({ errors,label }) => {
  return (
    errors &&
    errors.map(value => {
      if (value.field === label) {
        return <p key={value.field} className='alert m-0 mt-0'> *{value.message} </p>
      }
    })
  )
}

export default ErrAlert
