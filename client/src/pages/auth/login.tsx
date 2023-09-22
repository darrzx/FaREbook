import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import '../../styles/login.css';
import { EncryptStorage } from 'encrypt-storage';

const LOGIN_USER_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const encryptStorage = new EncryptStorage('timothydarren', {
  encAlgorithm: 'Rabbit',
});

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loginUser, { data, loading, error }] = useMutation(LOGIN_USER_MUTATION)
  const [errorMessage, setErrorMessage] = useState<string>(''); 

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });
      const token = data?.login;
      console.log(token)
      if(!token){
        setErrorMessage('Invalid email or password');
      }else{
        encryptStorage.setItem("jwtToken", token)
        window.location.href = '/'
      }
    } catch (error) {
      console.log(error, "gada")
    }
  };

  return (
    <div className="login-container">
        <img src='logofb.svg' className='fblogo'></img>
        <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-header">Log in to Facebook</h2>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="login-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              required
            />
          {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}
          <button type="submit" className="login-button">Log In</button>
          <a href="/forgotAccount" className="forgot-password">Forgotten account?</a>
          <hr className="line-login"/>
          <a href="/register" className="register-link">Create new account</a>
        </form>
        
    </div>
  );
};