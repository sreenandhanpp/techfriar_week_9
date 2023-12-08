import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import SignIn from './pages/SignIn/SignIn';
import PublicRoute from './components/PublicRoute/PublicRoute';
import UserRoute from './components/UserRoute/UserRoute';

function App() {
  return (
    <>
      <Routes>
        <Route exact path='/signin' element={<PublicRoute />} >
          <Route exact path='/signup' element={<SignUp />} />
        </Route>

        <Route exact path='/signin' element={<PublicRoute />} >
          <Route exact path='/signin' element={<SignIn />} />
        </Route>

        <Route exact path='/' element={<UserRoute />} >
          <Route exact path='/' element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
