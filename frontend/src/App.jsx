import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import SignIn from './pages/SignIn/SignIn';

function App() {
  return (
    <>
      <Routes>
        <Route exact path='/signin' element={<SignIn />} />
        <Route exact path='/signup' element={<SignUp />} />
        <Route exact path='/' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
