import React from "react";
// import sun from './Sun.svg'; 
// import moon from './Moon.svg'; 
import "./DarkMode.css";

const DarkMode = () => {

    const setDarkMode = () => {
        const body = document.querySelector("body");
        if (body) {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem("selectedTheme", "dark")
        }
    }

    const setLightMode = () => {
        const body = document.querySelector("body");
        if (body) {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem("selectedTheme", "light")
        }
    }
    
    const selectedTheme = localStorage.getItem("selectedTheme");

    if(selectedTheme === "dark"){
        setDarkMode();
        console.log("masuk dark")
    }

    const toggleTheme = (e: any) => {
        // console.log(e.target.checked)
        if(e.target.checked) {
            setDarkMode();
        } 
        else {
            setLightMode();
        }
    }

    return (
        <div className='dark_mode'>
            <input
                className='dark_mode_input'
                type='checkbox'
                id='darkmode-toggle'
                onChange={toggleTheme}
                // defaultChecked={selectedTheme === "dark"}
            />
            <label className='dark_mode_label' htmlFor='darkmode-toggle'>
                
            </label>
        </div>
    );
};

export default DarkMode;

