import './index.css';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a signup form with username, password, and password confirmation inputs,
 * password visibility toggle, error handling, and a link to the login page.
 */
const Signup = () => {
  const {
    firstName,
    lastName,
    username,
    password,
    passwordConfirmation,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('signup');

  return (
    <div className='container'>
      <h2>NUCircle</h2>
      <h2>Create your account</h2>
      <p>Join our community of Northeastern students</p>
      <form onSubmit={handleSubmit}>
        <h4>First Name</h4>
        <input
          type='text'
          value={firstName}
          onChange={event => handleInputChange(event, 'firstName')}
          placeholder='Enter your first name'
          required
          className='input-text'
        />
        <h4>Last Name</h4>
        <input
          type='text'
          value={lastName}
          onChange={event => handleInputChange(event, 'lastName')}
          placeholder='Enter your last name'
          required
          className='input-text'
        />
        <h4>Northeastern email</h4>
        <input
          type='text'
          value={username}
          onChange={event => handleInputChange(event, 'username')}
          placeholder='example@northeastern.edu'
          required
          className='input-text'
          id='username-input'
        />
        <h4>Password</h4>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={event => handleInputChange(event, 'password')}
          placeholder='Create a password'
          required
          className='input-text'
          id='password-input'
        />
        <input
          type={showPassword ? 'text' : 'password'}
          value={passwordConfirmation}
          onChange={e => handleInputChange(e, 'confirmPassword')}
          placeholder='Confirm your password'
          required
          className='input-text'
        />
        <div className='show-password'>
          <input
            type='checkbox'
            id='showPasswordToggle'
            checked={showPassword}
            onChange={togglePasswordVisibility}
          />
          <label htmlFor='showPasswordToggle'>Show Password</label>
        </div>
        <button type='submit' className='login-button'>
          Submit
        </button>
      </form>
      {err && <p className='error-message'>{err}</p>}
      <Link to='/' className='login-link'>
        Already have an account? Login here
      </Link>
    </div>
  );
};

export default Signup;
