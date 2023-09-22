import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/resetPassword.css';

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($id:ID!, $password:String!){
    resetPassword(id:$id, password:$password){
      id
      firstname
      surname
      email
      dob
      gender
      isActive
    }
  }
`;

const CHECK_PASSWORD_MUTATION = gql`
  mutation CheckOldAndNewPassword($id: ID!, $password: String!){
    checkOldAndNewPassword(id: $id, password: $password)
  } 
`;

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION);
  const [checkPassword] = useMutation(CHECK_PASSWORD_MUTATION);
  const { id } = useParams();
  const [errorMessage, setErrorMessage] = useState<string>(''); 

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const checkResponse = await checkPassword({
        variables: {
          id: id,
          password: password
        },
      });
  
      if (checkResponse.data.checkOldAndNewPassword) {
        setErrorMessage("The old and new password is the same!");
        return;
      }
  
      const resetResponse = await resetPassword({
        variables: {
          id: id,
          password: password
        },
      });
  
      if (resetResponse.data.resetPassword) {
        window.location.href = '/login';
      }
  
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="reset-password-container">
      <form className="reset-password-form">
        <h2 className="reset-password-header">Reset Password</h2>
        <hr className="line-reset" />
        <input
          type="password"
          name="password"
          placeholder="New Password"
          className="reset-password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="reset-password-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}
        <button type="submit" className="reset-password-button" onClick={handleResetPassword}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
