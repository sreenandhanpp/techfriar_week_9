import React, { useState } from 'react'
import './style.css'
import Input from '../../components/Input/Input'
import { URL } from '../../utils/url';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { USER } from '../../redux/constants/user';
import { toast } from 'react-toastify'
import axios from 'axios';
import Loader from '../../components/Loader/Loader';


const SignUp = () => {
    const [errors, setErrors] = useState([]);
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [profile, setProfile] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector(state => state.signup);

    const newErrors = [];
    /**
    * Validates form input fields and collects error messages for each invalid field.
    * Returns an array of error objects. 
    **/
    const validateForm = () => {
        const newErrors = [];

        // Check if the name is empty
        if (formValues.name.trim() === '') {
            newErrors.push({ field: 'name', message: 'Name is required' });
        }

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

        // Check if a profile image is selected
        if (!profile) {
            newErrors.push({ field: 'profile', message: 'Profile image is required' });
        }

        return newErrors;
    };

    const HandleSubmit = async (e) => {
        e.preventDefault();
        let Errors = await validateForm();
        if (Errors.length === 0) {
            const formData = new FormData();
            formData.append('name', formValues.name);
            formData.append('email', formValues.email);
            formData.append('profile', profile);
            formData.append('password', formValues.password);
            try {
                dispatch({ type: USER.SIGNUP_REQUEST });
                axios.post(URL + 'user/api/signup', formData).then(res => {
                    navigate('/', { replace: true })
                    dispatch({ type: USER.SIGNUP_SUCCESS, payload: res.data });

                }).catch(error => {
                    if (error) {
                        dispatch({ type: USER.SIGNUP_SUCCESS, payload: error.response.data.message });
                        if (error.response.data.message) {
                            newErrors.push({ field: 'email', message: error.response.data.message });
                            setErrors(newErrors); // Update the state with the new errors
                        }
                    }
                })
            } catch (err) {
                console.log(err)
                dispatch({ type: USER.SIGNUP_FAILED, payload: "something went wrong" });
                toast.error("something went wrong", {
                    position: toast.POSITION.BOTTOM_CENTER
                });
            }
        } else {
            setErrors(Errors)
        }
    }

    // Handles changes in form input fields, updating form values and removing associated validation errors.
    const HandleChange = (e, fieldName) => {
        // Update the form field state using the spread operator to maintain previous values
        setFormValues((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
        });

        // Filter out any previous validation errors related to the changed field
        const updatedErrors = errors.filter((error) => error.field !== fieldName);

        // Set the updated errors state, removing errors associated with the changed field
        setErrors(updatedErrors);
    }

    // Define a function to handle the selection of image files
    const handleFile = (e, fieldName) => {
        setProfile(e.target.files[0]);
        const updatedErrors = errors.filter((error) => error.field !== fieldName);
        setErrors(updatedErrors);
    }
    return (
        loading ?
            <Loader />
            :

            <div className="signup-wrapper">
                <div class="signup-container">
                    <h2>Signup</h2>
                    <Input
                        type={'file'}
                        id={'profile'}
                        name={'profile'}
                        accept={'image/*'}
                        HandleChange={handleFile}
                        label={'Profile'}
                        errors={errors}
                    />
                    <Input
                        type={'text'}
                        id={'name'}
                        name={'name'}
                        HandleChange={HandleChange}
                        label={'Name'}
                        errors={errors}
                        value={formValues.name}
                    />
                    <Input
                        type={'email'}
                        id={'email'}
                        name={'email'}
                        HandleChange={HandleChange}
                        label={'Email'}
                        errors={errors}
                        value={formValues.email}
                    />
                    <Input
                        type={'password'}
                        id={'password'}
                        name={'password'}
                        HandleChange={HandleChange}
                        label={'password'}
                        errors={errors}
                        value={formValues.password}
                    />
                    <button class="signup-btn" onClick={HandleSubmit}>Signup</button>
                </div>
            </div>
    )
}

export default SignUp
