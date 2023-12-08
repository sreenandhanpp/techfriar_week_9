import React, { useState } from 'react';
import './style.css';
import Input from '../../components/Input/Input';
import { URL } from '../../utils/url';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { USER } from '../../redux/constants/user';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../../components/Loader/Loader';

const SignIn = () => {
  const [errors, setErrors] = useState([]);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.signin);

  const newErrors = [];

  // Validates form input fields and collects error messages for each invalid field.
  const validateForm = () => {
    const newErrors = [];

    // Check if the email is empty and follows a valid pattern
    if (formValues.email.trim() === '') {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(formValues.email)) {
        newErrors.push({ field: 'email', message: 'Invalid email' });
      }
    }

    // Check if the password is empty
    if (formValues.password.trim() === '') {
      newErrors.push({ field: 'password', message: 'Password is required' });
    }

    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const Errors = validateForm();
    if (Errors.length === 0) {
      try {
        dispatch({ type: USER.SIGNIN_REQUEST });
        const res = await axios.post(URL + 'user/api/signin', {
          email: formValues.email,
          password: formValues.password,
        });
        dispatch({ type: USER.SIGNIN_SUCCESS, payload: res.data });
        navigate('/', { replace: true });
      } catch (error) {
        if (error.response && error.response.data.message) {
          newErrors.push({ field: 'password', message: error.response.data.message });
          setErrors(newErrors);
        }
        console.log(error)
        dispatch({ type: USER.SIGNIN_FAILED, payload: 'something went wrong' });
        toast.error('Something went wrong', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
    } else {
      setErrors(Errors);
    }
  };

  const handleChange = e => {
    setFormValues(prev => {
      return { ...prev, [e.target.name]: e.target.value };
    });

    const updatedErrors = errors.filter(error => error.field !== e.target.name);
    setErrors(updatedErrors);
  };

  return (
    loading ? (
      <Loader />
    ) : (
      <div className="signup-wrapper">
        <div className="signup-container">
          <h2>SignIn</h2>
          <Input
            type={'email'}
            id={'email'}
            name={'email'}
            HandleChange={handleChange}
            label={'Email'}
            errors={errors}
            value={formValues.email}
          />
          <Input
            type={'password'}
            id={'password'}
            name={'password'}
            HandleChange={handleChange}
            label={'Password'}
            errors={errors}
            value={formValues.password}
          />
          <button className="signup-btn" onClick={handleSubmit}>
            Sign In
          </button>
        </div>
      </div>
    )
  );
};

export default SignIn;
