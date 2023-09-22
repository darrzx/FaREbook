import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";
import '../../styles/register.css';
import emailjs from '@emailjs/browser';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($inputUser:NewUser!){
    createUser(inputUser:$inputUser){
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

function containsAlphabeticAndNumeric(password: string) {
  const hasAlphabetic = /[a-zA-Z]/.test(password);
  const hasNumeric = /[0-9]/.test(password);
  return hasAlphabetic && hasNumeric;
}


export function Register() {
    const [errorMessage, setErrorMessage] = useState<string>(''); 

    const [formData, setFormData] = useState({
        firstname: '',
        surname: '',
        email: '',
        password: '',
        dob: '',
        gender: '',
        isActive: false
      });

      const [createUser, { data, loading, error }] = useMutation(CREATE_USER_MUTATION);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevUser) => ({ ...prevUser, [name]: value }));
      };
    
      const handleSubmit = async(e: React.FormEvent) => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentDay = new Date().getDate();

        const dobYear = new Date(formData.dob).getFullYear();
        const dobMonth = new Date(formData.dob).getMonth() + 1;
        const dobDay = new Date(formData.dob).getDate();

        let age = currentYear - dobYear;

        if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDay < dobDay)) {
            age--;
        }

        if (formData.firstname === "" || formData.surname === "" || formData.email === "" || formData.password === "" || formData.dob === "" || formData.gender === "") {
          setErrorMessage('All data must be filled');
        }else if (formData.firstname[0] !== formData.firstname[0].toUpperCase()) {
          setErrorMessage('First Name must start with an uppercase letter!');
        }else if (formData.password.length < 5) {
          setErrorMessage(`Password must be at least 5 characters!`);
        }else if (!containsAlphabeticAndNumeric(formData.password)) {
          setErrorMessage('Password must be Alphanumeric!');
        }else if (age < 10) {
          setErrorMessage('Age must be at least 10 years!');
        }else {
          try {
            const inputUser = {
              firstname: formData.firstname,
              surname: formData.surname,
              email: formData.email,
              password: formData.password,
              dob: formData.dob,
              gender: formData.gender,
              isActive: false
            };
              
            createUser({
              variables: {
                inputUser: inputUser,
              },
            }).then(async (response) => {
              const Params = {
                from_name: formData.firstname + " " +formData.surname,
                message: 'http://127.0.0.1:5173/activate/'+response.data.createUser.id,
                email_id: formData.email
              };

              await emailjs.send('service_lk0qaj5', 'template_t0zluww', Params, 'ET5YtykRCCDKgWLwF')
              .then((response) => {
                console.log('Email sent successfully:', response);
              })
              .catch((error) => {
                console.error('Error sending email:', error);
              });

              setFormData({
                firstname: "",
                surname: "",
                email: "",
                password: "",
                dob: "",
                gender: "",
                isActive: false
              });

              setErrorMessage("")
              window.location.href = '/login'

            }).catch((error) => {
                setErrorMessage(error.message); 
            });
        
            console.log({data, loading, error})
          } catch (error) {
            console.log(error)
          }
          e.preventDefault();
        }
      };

    return (
      <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-header">Register</div>
        <div>
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label htmlFor="surname">Sur Name</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label htmlFor="dob">DOB</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div className="gender-container">
          <label>Gender</label>
          <div>
            <input
              type="radio"
              id="male"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
              required
            />
            <label htmlFor="male">Male</label>
          </div>
          <div>
            <input
              type="radio"
              id="female"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
              required
            />
            <label htmlFor="female">Female</label>
          </div>
        </div>
        {errorMessage && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{errorMessage}</p>}
        <button type="submit" className="register-button">Register</button>
        <a href="/login" className="login-link">Login</a>
      </form>
    </div>
    )
}
