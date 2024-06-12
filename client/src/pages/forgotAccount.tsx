import { gql, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import '../styles/forgotAccount.css';
import emailjs from '@emailjs/browser';

const FIND_USER_QUERY = gql`
    query FindAccount($email:String!){
        findAccount(email:$email){
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

export function ForgotAccount() {
  const [email, setEmail] = useState('');
  const { loading, error, data, refetch} =  useQuery(FIND_USER_QUERY, {
    variables: { email },
  })

  console.log(data)

  const handleCancel = () => {
    window.location.href = '/login'
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if(data){
        console.log(data.findAccount.id)
        const Params = {
            from_name: data.findAccount.firstname + " " + data.findAccount.surname,
            message: 'http://127.0.0.1:5173/resetPassword/'+data.findAccount.id,
            email_id: data.findAccount.email
          };
          await emailjs.send('service_lk0qaj5', 'template_t0zluww', Params, 'ET5YtykRCCDKgWLwF')
          .then((response) => {
            console.log('Email sent successfully:', response);
          })
          .catch((error) => {
            console.error('Error sending email:', error);
          });
    }
    else{
        console.log("GAADA")
    }
  };

  return (
    <div className="forgot-account-container">
      <form className="forgot-account-form">
        <h2 className="forgot-account-header">Find Your Account</h2>
        <hr className="line-forgot"/>
        <p className="forgot-account-description">
          Please enter your email address to search for your account.
        </p>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          className="forgot-account-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="button-container">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </form>
    </div>
  );
};