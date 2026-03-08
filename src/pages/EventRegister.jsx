import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useI18n, t } from '../i18n/context';
import { ui } from '../i18n/translations';

const EventRegister = () => {
    const navigate = useNavigate();
    const { lang } = useI18n();

    // Redirect to the events list or the specific next event if known
    // The new registration flow is inside NextEventHero on the details page
    useEffect(() => {
        navigate('/events');
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-hbm-cream">
            <SEO path="/events/register" title={t(ui.form.regSeoTitle, lang)} description={t(ui.form.regSeoDesc, lang)} />
            <p>Redirecting to events...</p>
        </div>
    );
};

export default EventRegister;
