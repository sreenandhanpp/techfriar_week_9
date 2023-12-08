import React from 'react'
import ErrAlert from '../ErrAlert/ErrAlert'

const Input = ({ type, id, placeholder, label, errors, name, HandleChange, value, accept }) => {
    return (
        <div class="input-group">
            <label >{label}</label>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                name={name}
                onChange={(e) => HandleChange(e, name)}
                accept={accept}
                value={value}
            />
            <ErrAlert errors={errors} label={name} />
        </div>
    )
}

export default Input
