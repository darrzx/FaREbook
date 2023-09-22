import { useLocation } from 'react-router-dom';
import '../../styles/footer.css';

export default function Header(){
    const location = useLocation();
    const footerPaths = ["/login", "/register", "/forgotAccount"];
    const footer = footerPaths.includes(location.pathname);

    if (!footer) {
        return null; 
    }

    return (
        <div className="footer-container">
            <div className="footer-language">
                <span>English (US)</span>
                <span>Bahasa Indonesia</span>
                <span>Español</span>
                <span>Português</span>
                <span>Français</span>
                <span>Deutsch</span>
                <span>日本語</span>
                <span>한국어</span>
            </div>
            <div className="footer-links">
                <span><a href="/register">Sign Up</a></span>
                <span><a href="/login">Log In</a></span>
                <span><a href="https://www.facebook.com/privacy/policy/?entry_point=facebook_page_footer">Privacy Policy</a></span>
                <span><a href="https://www.facebook.com/privacy/policies/cookies/?entry_point=cookie_policy_redirect&entry=0">Cookies Policy</a></span>
                <span>Watch</span>
                <span>People</span>
                <span>Pages</span>
                <span>Page categories</span>
                <span>Places</span>
                <span>Games</span>
                <span>Locations</span>
            </div>
            <div className="footer-links">
                <span>Marketplace</span>
                <span>Facebook Pay</span>
                <span>Groups</span>
                <span>Oculus</span>
                <span>Portal</span>
                <span><a href="https://www.instagram.com/">Instagram</a></span>
                <span><a href="https://www.facebook.com/biz/directory/">Services</a></span>
                <span>Fundraisers</span>
                <span><a href="https://www.facebook.com/help/?ref=pf">Help</a></span>
                <span><a href="https://www.facebook.com/policies_center/">Terms</a></span>
                <span>Create ad</span>
                <span>Create Page</span>
            </div>
            <div className="footer-copy">
                <span>Meta &copy; 2023</span>
            </div>
        </div>
    );
}