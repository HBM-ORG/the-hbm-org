import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { 
  Building2, Hotel, GraduationCap, Users, CalendarDays, ArrowRight, Star, 
  MessageCircle, Zap, BarChart3, Heart, TrendingUp, Smile, Globe, Coffee, 
  Briefcase, Layout, Award, Shield, UserPlus, Sparkles, Handshake, BarChart, School, Quote
} from 'lucide-react'
import EyebrowBadge from '../components/EyebrowBadge'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'
import { WobbleCard } from '../components/ui/wobble-card'
import { motion, AnimatePresence } from 'framer-motion'
import LeadGenCTA from '../components/LeadGenCTA'
import SEO from '../components/SEO'


const tabs = [
  { 
    id:'events', 
    icon: CalendarDays, 
    label: {en:'Events',he:'אירועים'},
    headline: {en:'Turn Every Event Into A Human Experience.',he:'המנוע לאירועים אנושיים.'},
    subtitle: {en:'We all know the truth: Networking is awkward. We fixed it.',he:'כולנו יודעים את האמת: נטוורקינג זה מביך. אנחנו תיקנו את זה.'},
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=75&w=1200&auto=format&fit=crop", 
    color: "#6160AB",
    points:[
      {icon:MessageCircle, bold:{en:'Transform Networking Into Real Conversations.',he:'הפכו נטוורקינג לשיחות אמיתיות.'}, text:{en:'At every event, people hide behind their screens because they\'re scared to approach someone new. Meeter gives guests the invitation to meet someone new for 8-minute encounters that are actually fun and natural!',he:'בכל אירוע, אנשים מתחבאים מאחורי המסכים שלהם כי הם מפחדים לגשת למישהו חדש. Meeter נותנת לאורחים את ההזמנה לפגוש מישהו חדש למפגשים של 8 דקות שהם באמת מהנים וטבעיים!'}},
      {icon:Heart, bold:{en:'Turn Positive Experiences Into Brand Memory.',he:'הפכו חוויות חיוביות לזיכרון מותג.'}, text:{en:'When people feel genuinely connected at your event, they don\'t just remember the content—they remember YOUR brand. Meeter turns great connections into lasting memories that stick with attendees long after they leave.',he:'כשאנשים מרגישים מחוברים באמת באירוע שלכם, הם לא רק זוכרים את התוכן—הם זוכרים את המותג שלכם. Meeter הופכת חיבורים נהדרים לזיכרונות מתמשכים שנשארים עם המשתתפים הרבה אחרי שהם עוזבים.'}},
      {icon:UserPlus, bold:{en:'Increased "Word-of-Mouth" Marketing.',he:'שיווק "פה לאוזן" מוגבר.'}, text:{en:'When guests make real connections, they don\'t just come back, they bring others. Meeter creates word-of-mouth that money can\'t buy.',he:'כשאורחים יוצרים חיבורים אמיתיים, הם לא רק חוזרים, הם מביאים אחרים. Meeter יוצרת שיווק פה לאוזן שאי אפשר לקנות בכסף.'}},
    ]
  },
  { 
    id:'companies', 
    icon: Building2, 
    label: {en:'Companies',he:'חברות'},
    headline: {en:'Your Team Works Together. But Do They Actually Know Each Other?',he:'הצוות שלך עובד יחד. אבל האם הם באמת מכירים אחד את השני?'},
    subtitle: {en:'Many employees feel disconnected from their organizations. This disconnect hurts culture, teamwork, and overall productivity.',he:'עובדים רבים מרגישים מנותקים מהארגונים שלהם. הניתוק הזה פוגע בתרבות, בעבודת הצוות ובפרודוקטיביות הכללית.'},
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=75&w=1200&auto=format&fit=crop",
    color: "#F07B3C",
    points:[
      {icon:Layout, bold:{en:'Break Down Silos Across Departments.',he:'שברו את המחיצות בין המחלקות.'}, text:{en:'Marketing doesn\'t talk to engineering. Sales doesn\'t know finance. Meeter connects employees across departments who never interact—sparking collaboration, innovation, and cross-pollination of ideas that change everything.',he:'השיווק לא מדבר עם ההנדסה. המכירות לא מכירות את הכספים. Meeter מחברת עובדים בין מחלקות שלעולם לא מתקשרים—מציתה שיתוף פעולה, חדשנות והפריה הדדית של רעיונות שמשנים הכל.'}},
      {icon:Heart, bold:{en:'Prevent Burnout and Boost Retention.',he:'מנעו שחיקה ושפרו שימור.'}, text:{en:'Employees who feel connected are far less likely to leave. Meeter reduces stress, increases resilience, and creates genuine social bonds that make people actually want to come to work.',he:'עובדים שמרגישים מחוברים נוטים הרבה פחות לעזוב. Meeter מפחיתה לחץ, מגבירה חוסן ויוצרת קשרים חברתיים אותנטיים שגורמים לאנשים באמת לרצות לבוא לעבודה.'}},
      {icon:Zap, bold:{en:'We\'re Not Operational, We\'re Fun!',he:'אנחנו לא תפעוליים, אנחנו כיפיים!'}, text:{en:'People don\'t bond over spreadsheets, they bond over shared laughs, stories, and human moments. Meeter gives your team permission to connect as people, not just colleagues. When work conversations become real conversations, culture comes alive.',he:'אנשים לא מתחברים סביב גיליונות אלקטרוניים, הם מתחברים סביב צחוק משותף, סיפורים ורגעים אנושיים. Meeter נותנת לצוות שלכם רשות להתחבר כאנשים, לא רק כקולגות. כששיחות עבודה הופכות לשיחות אמיתיות, התרבות מתעוררת לחיים.'}},
    ]
  },
  { 
    id:'hotels', 
    icon: Hotel, 
    label: {en:'Hotels',he:'מלונות'},
    headline: {en:'Your Hotel Is More Than a Place to Sleep. Make It the Place Where Opportunities Begin.',he:'המלון שלך הוא יותר ממקום לישון בו. הפוך אותו למקום שבו הזדמנויות מתחילות.'},
    subtitle: {en:'Your rooms are booked, but your public spaces are still waiting to come alive.',he:'החדרים שלכם מלאים, אבל המרחבים הציבוריים שלכם עדיין מחכים להתעורר לחיים.'},
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=75&w=1200&auto=format&fit=crop",
    color: "#73C154",
    points:[
      {icon:Sparkles, bold:{en:'Offer Meaningful Moments in your hotel.',he:'הציעו רגעים משמעותיים במלון שלכם.'}, text:{en:'Every hotel has a nice lobby and good Wi-Fi. But how many offer real human connection? Meeter transforms your public spaces into living, breathing hubs where solo travelers become friends, business partners, and drinking buddies.',he:'לכל מלון יש לובי יפה ו-Wi-Fi טוב. אבל כמה מציעים חיבור אנושי אמיתי? Meeter הופכת את המרחבים הציבוריים שלכם למוקדים חיים ונושמים שבהם מטיילים בודדים הופכים לחברים, שותפים עסקיים ושותפים לשתייה.'}},
      {icon:Coffee, bold:{en:'Fill Your Bar and Boost F&B Revenue.',he:'מלאו את הבר שלכם והגדילו הכנסות F&B.'}, text:{en:'Empty seats at happy hour mean lost revenue. Meeter brings guests out of their rooms and into your bar, restaurant, and lobby. Creating a scheduled social experience that drives real spending and keeps your spaces buzzing with life.',he:'כיסאות ריקים ב-happy hour משמעותם הפסד הכנסה. Meeter מוציאה את האורחים מהחדרים שלהם אל הבר, המסעדה והלובי שלכם. יוצרת חוויה חברתית מתוזמנת שמניעה הוצאות אמיתיות ושומרת על המרחבים שלכם שוקקים חיים.'}},
      {icon:TrendingUp, bold:{en:'Become a Magnet for Business Travelers.',he:'הפכו למגנט לנוסעים עסקיים.'}, text:{en:'When business travelers know they can network, meet locals, or find a workout partner at YOUR hotel, you become their first choice. Meeter turns one-time guests into loyal advocates who book direct and tell everyone about the experience.',he:'כשנוסעים עסקיים יודעים שהם יכולים לעשות נטוורקינג, לפגוש מקומיים או למצוא שותף לאימון במלון שלכם, אתם הופכים לבחירה הראשונה שלהם. Meeter הופכת אורחים חד-פעמיים לממליצים נאמנים שמזמינים ישירות ומספרים לכולם על החוויה.'}},
    ]
  },
  { 
    id:'universities', 
    icon: GraduationCap, 
    label: {en:'Universities',he:'אוניברסיטאות'},
    headline: {en:'Your Campus Has Thousands of Students. How Many Feel Alone?',he:'בקמפוס שלך יש אלפי סטודנטים. כמה מהם מרגישים לבד?'},
    subtitle: {en:'Transform your campus into a place where everyone can meet, connect, and belong.',he:'הפכו את הקמפוס שלכם למקום שבו כולם יכולים להיפגש, להתחבר ולהרגיש שייכים.'},
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=75&w=1200&auto=format&fit=crop",
    color: "#6160AB",
    points:[
      {icon:Users, bold:{en:'Combat Campus Loneliness From Day One.',he:'הילחמו בבדידות בקמפוס מהיום הראשון.'}, text:{en:'Students are surrounded by thousands of peers but feel completely isolated. Meeter gives them a simple, fun way to meet new people in just 8 minutes. No awkward "how do I make friends?" stress. Just real human connection.',he:'סטודנטים מוקפים באלפי עמיתים אך מרגישים מבודדים לחלוטין. Meeter נותנת להם דרך פשוטה ומהנה לפגוש אנשים חדשים תוך 8 דקות בלבד. בלי לחץ מביך של "איך אני מכיר חברים?". פשוט חיבור אנושי אמיתי.'}},
      {icon:School, bold:{en:'Build Community Across Majors and Years.',he:'בנו קהילה בין חוגים ושנתונים.'}, text:{en:'Engineering students never meet art students. Freshmen don\'t connect with seniors. Meeter breaks down barriers and creates cross-campus friendships that enrich the entire university experience and last beyond graduation.',he:'סטודנטים להנדסה לא פוגשים סטודנטים לאמנות. שנה א\' לא מתחברים עם בוגרים. Meeter שוברת מחסומים ויוצרת חברויות חוצות קמפוס שמעשירות את חווית האוניברסיטה כולה ונמשכות גם אחרי הסיום.'}},
      {icon:GraduationCap, bold:{en:'Boost Student Well-Being and Retention.',he:'שפרו את רווחת הסטודנטים ואת אחוזי השימור.'}, text:{en:'Students who feel connected stay enrolled, perform better, and become proud alumni. Meeter reduces mental health struggles, increases engagement, and turns your campus into a place students actually want to be.',he:'סטודנטים שמרגישים מחוברים נשארים רשומים, מצליחים יותר והופכים לבוגרים גאים. Meeter מפחיתה קשיים נפשיים, מגבירה מעורבות והופכת את הקמפוס שלכם למקום שסטודנטים באמת רוצים להיות בו.'}},
    ]
  },
  { 
    id:'communities', 
    icon: Users, 
    label: {en:'Communities',he:'קהילות'},
    headline: {en:'Strong Communities Are Measured By The Strength Of Their Connections.',he:'קהילות חזקות נמדדות בחוזק החיבורים שלהן.'},
    subtitle: {en:'Build a community where members truly know each other—not just share the same WhatsApp group.',he:'בנו קהילה שבה החברים באמת מכירים אחד את השני—לא רק חולקים אותה קבוצת וואטסאפ.'},
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=75&w=1200&auto=format&fit=crop",
    color: "#F07B3C",
    points:[
      {icon:MessageCircle, bold:{en:'Create Deeper Community Engagement.',he:'צרו מעורבות קהילתית עמוקה יותר.'}, text:{en:'Move beyond lectures and presentations. Meeter transforms community events into genuine human experiences where members share real stories, build authentic friendships, and feel like they truly belong.',he:'עברו מעבר להרצאות ומצגות. Meeter הופכת אירועים קהילתיים לחוויות אנושיות אמיתיות שבהן חברים משתפים סיפורים אמיתיים, בונים חברויות אותנטיות ומרגישים שהם באמת שייכים.'}},
      {icon:Shield, bold:{en:'Lower Social Anxiety and Increase Participation.',he:'הפחיתו חרדה חברתית והגדילו השתתפות.'}, text:{en:'8 minutes, clear structure, no pressure to perform. Meeter removes the awkwardness of "who do I talk to?" and gives every member, introverts included, a safe, easy way to connect.',he:'8 דקות, מבנה ברור, בלי לחץ להופיע. Meeter מסירה את המבוכה של "עם מי אני מדבר?" ונותנת לכל חבר, כולל מופנמים, דרך בטובה וקלה להתחבר.'}},
      {icon:Heart, bold:{en:'Keep People Coming Back.',he:'גרמו לאנשים לחזור.'}, text:{en:'When connections are real, attendance grows. Members don\'t come back for content—they come back for the people they\'ve met. Meeter turns one-time attendees into loyal community members.',he:'כשחיבורים הם אמיתיים, הנוכחות גדלה. חברים לא חוזרים בשביל התוכן—הם חוזרים בשביל האנשים שפגשו. Meeter הופכת משתתפים חד-פעמיים לחברי קהילה נאמנים.'}},
    ]
  },
  {
    id: 'office',
    icon: Building2,
    label: { en: 'Office Buildings', he: 'בנייני משרדים' },
    headline: { en: 'One Building. Many Companies. Thousands of Employees. Zero Connection.', he: 'בניין אחד. הרבה חברות. אלפי עובדים. אפס חיבור.' },
    subtitle: { en: 'Turn your public office spaces into a business ecosystem where deals, friendships, and opportunities happen.', he: 'הפכו את החללים הציבוריים שלכם לאקו-סיסטם עסקי שבו עסקאות, חברויות והזדמנויות קורות.' },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=1200&auto=format&fit=crop",
    color: "#bbc0ff",
    points: [
      { icon: Layout, bold: { en: 'Transform Isolation Into Community.', he: 'הפכו בידוד לקהילה.' }, text: { en: 'Floor 22 doesn\'t know Floor 20 exists. Employees share the same building but live in separate worlds. Meeter breaks down the invisible walls and creates real connections between companies, turning your tower into a connected business community.', he: 'קומה 22 לא יודעת שקומה 20 קיימת. עובדים חולקים את אותו בניין אבל חיים בעולמות נפרדים. Meeter שוברת את הקירות הבלתי נראים ויוצרת חיבורים אמיתיים בין חברות, הופכת את המגדל שלכם לקהילה עסקית מחוברת.' } },
      { icon: Handshake, bold: { en: 'Unlock Business Opportunities in Your Own Building.', he: 'פתחו הזדמנויות עסקיות בבניין שלכם.' }, text: { en: 'The next deal, partnership, or mentor your tenants are looking for might be working two floors up. Meeter creates serendipitous encounters that spark collaborations, investments, and business relationships—all within your building.', he: 'העסקה הבאה, השותפות או המנטור שהדיירים שלכם מחפשים עשויים לעבוד שתי קומות למעלה. Meeter יוצרת מפגשים אקראיים שמציתים שיתופי פעולה, השקעות ומערכות יחסים עסקיות—הכל בתוך הבניין שלכם.' } },
      { icon: BarChart, bold: { en: 'Become THE Destination for Business Professionals.', he: 'הפכו ליעד העיקרי למקצוענים עסקיים.' }, text: { en: 'When tenants know they can network, find partners, and build relationships without leaving the building, your tower becomes more than office space—it becomes THE place to do business.', he: 'כשדיירים יודעים שהם יכולים לעשות נטוורקינג, למצוא שותפים ולבנות מערכות יחסים בלי לעזוב את הבניין, המגדל שלכם הופך ליותר מסתם שטח משרדי—הוא הופך למקום לעשות בו עסקים.' } }
    ]
  }
]

const fullTestimonials = [
  { quote:{en:'"Increased our retention by 20% in 6 months."',he:'"העלינו את השימור ב-20% בשישה חודשים."'}, name:'Sarah L.', role:{en:'HR Director',he:'מנהלת משאבי אנוש'} },
  { quote:{en:'"Our guests finally talk to each other. The lobby is alive."',he:'"האורחים שלנו סוף סוף מדברים אחד עם השני. הלובי חי."'}, name:'David K.', role:{en:'Hotel GM',he:'מנכ"ל מלון'} },
  { quote:{en:'"Students found study partners within the first week."',he:'"סטודנטים מצאו שותפי לימוד בתוך השבוע הראשון."'}, name:'Prof. Amit R.', role:{en:'Dean of Students',he:'דיקן סטודנטים'} },
  { quote:{en:'"The most authentic networking event I have ever attended."',he:'"אירוע הנטוורקינג הכי אותנטי שהייתי בו פעם."'}, name:'Jessica M.', role:{en:'Event Planner',he:'מפיקת אירועים'} },
  { quote:{en:'"Finally, real conversations. No sales pitches."',he:'"סוף סוף, שיחות אמיתיות. בלי מכירות."'}, name:'Mark T.', role:{en:'Tech CEO',he:'מנכ"ל הייטק'} },
  { quote:{en:'"Simple, effective, and deeply human."',he:'"פשוט, יעיל, ואנושי עמוק."'}, name:'Rachel G.', role:{en:'Community Mgr',he:'מנהלת קהילה'} },
  { quote:{en:'"Our remote team feels closer than ever before."',he:'"הצוות המרוחק שלנו מרגיש קרוב מאי פעם."'}, name:'Tom H.', role:{en:'Startup Founder',he:'מייסד סטארטאפ'} },
  { quote:{en:'"It broke the ice immediately. No awkward pauses."',he:'"זה שבר את הקרח מיד. בלי שתיקות מביכות."'}, name:'Emily S.', role:{en:'Team Lead',he:'ראש צוות'} },
  { quote:{en:'"A game changer for large conferences."',he:'"משנה משחק לכנסים גדולים."'}, name:'Michael B.', role:{en:'Conf Organizer',he:'מארגן כנסים'} },
  { quote:{en:'"Psychologically safe and structured perfectly."',he:'"בטוח פסיכולוגית ומובנה בצורה מושלמת."'}, name:'Dr. Cohen', role:{en:'Psychologist',he:'פסיכולוג'} },
  { quote:{en:'"Attendees stayed longer because of the connections."',he:'"משתתפים נשארו יותר זמן בגלל החיבורים."'}, name:'Nina P.', role:{en:'Festival Director',he:'מנהלת פסטיבל'} },
  { quote:{en:'"Authentic connection at scale. Brilliant."',he:'"חיבור אותנטי בקנה מידה רחב. מבריק."'}, name:'Alex W.', role:{en:'VP Innovation',he:'סמנכ"ל חדשנות'} },
]

const partnerLogos = [
  { name: 'Partner 1', src: '/partner-logos/44.png' },
  { name: 'Partner 2', src: '/partner-logos/45.png' },
  { name: 'Partner 3', src: '/partner-logos/46.png' },
  { name: 'Partner 4', src: '/partner-logos/47.png' },
  { name: 'Partner 5', src: '/partner-logos/48.png' },
  { name: 'Partner 6', src: '/partner-logos/49.png' },
  { name: 'Partner 7', src: '/partner-logos/50.png' },
  { name: 'Partner 8', src: '/partner-logos/51.png' },
  { name: 'Partner 9', src: '/partner-logos/52.png' },
  { name: 'Partner 10', src: '/partner-logos/53.png' },
  { name: 'Partner 11', src: '/partner-logos/54.png' },
  { name: 'Partner 12', src: '/partner-logos/55.png' },
  { name: 'Partner 13', src: '/partner-logos/56.png' },
]

export default function MeeterWho() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('events')
  const currentTab = tabs.find(t => t.id === activeTab)
  const [testimonialsList, setTestimonialsList] = useState([])
  const [partnerLogosList, setPartnerLogosList] = useState(partnerLogos)

  useEffect(() => {
    const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
    fetch(`${base}/api/site-content`)
      .then(res => res.json())
      .then(data => {
        if (data.testimonials && data.testimonials.length > 0) setTestimonialsList(data.testimonials);
        if (data.partners && data.partners.length > 0) setPartnerLogosList(data.partners);
      })
      .catch(err => console.error(err));
  }, []);

  // Load SociableKIT script
  useEffect(() => {
    const scriptUrl = 'https://widgets.sociablekit.com/instagram-reels/widget.js';
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    
    const initWidget = () => {
      if (window.sk_instagram_reels && typeof window.sk_instagram_reels.init === 'function') {
         window.sk_instagram_reels.init();
      } else if (window.SociableKIT && typeof window.SociableKIT.init === 'function') {
         window.SociableKIT.init();
      }
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      script.onload = initWidget;
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    const timer = setTimeout(initWidget, 1500);
    const backupTimer = setTimeout(initWidget, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(backupTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-hbm-cream relative transition-colors duration-700">
      <SEO />
      
      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 flex flex-col items-center">
          <div className="max-w-4xl mx-auto text-center px-6 mb-8">
            <div className="mb-6">
              <EyebrowBadge text="THE MEETER - WHO IS IT FOR?" />
            </div>
            <h1 className="text-4xl md:text-7xl font-bold font-['Sora'] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#6160AB] to-[#F07B3C]" style={{letterSpacing:'-2px'}}>
                {t({en:'Where Does It Meet You?',he:'איפה זה פוגש אותנו?'},lang)}
            </h1>
            <p className="text-xl text-hbm-gray font-['Sofia_Pro']">
                {t({en:'Tailored solutions for every sector.',he:'פתרונות מותאמים לכל סקטור.'},lang)}
            </p>
          </div>
          
      </section>

      {/* Sector Tabs Section */}
      <section id="sector-tabs" className="relative z-0 min-h-[700px] md:min-h-[850px] py-12 md:py-0 overflow-hidden">
        
        {/* LIVE REELS ATMOSPHERE - Subtle background layer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: window.innerWidth < 768 ? 0.05 : 0.15 }}
          className="absolute inset-0 z-5 pointer-events-none overflow-hidden"
          style={{
            filter: 'blur(60px) grayscale(100%)',
            WebkitFilter: 'blur(60px) grayscale(100%)',
          }}
        >
          <div 
            className='sk-ww-instagram-reels w-full h-[150%] -translate-y-[15%]' 
            data-embed-id='25653662'
          ></div>
        </motion.div>

        {/* DYNAMIC IMAGE BACKGROUNDS */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center bg-hbm-cream"
            >
              {/* Solid color placeholder matching the image theme while loading */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: currentTab?.color }}
               />
              
              <img
                src={currentTab?.image}
                alt=""
                className="w-full h-full object-cover grayscale-[0.2] blur-[2px] md:blur-[2px] opacity-40 md:opacity-60 transition-opacity duration-1000"
                style={{
                  objectPosition: 'center',
                  maskImage: "radial-gradient(circle, black 50%, transparent 98%)",
                  WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 98%)"
                }}
              />
            </motion.div>
          </AnimatePresence>
          {/* Enhanced glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-hbm-cream/60 via-transparent to-hbm-cream/60 md:bg-hbm-cream/20 backdrop-blur-[1px]" />
        </div>

        <BubbleContainer bgColor="transparent" className="!bg-transparent border-none shadow-none !py-0 relative z-20">
          <div className="max-w-6xl mx-auto w-full px-4">
            
            {/* Tab Navigation - STABLE & STICKY */}
            <div className="sticky top-20 z-[100] pt-6 md:pt-12 mb-8 md:mb-16 pointer-events-auto">
              {/* Desktop: Centered centered tabs | Mobile: Full-width scrollable tabs */}
              <div className="md:w-fit md:mx-auto relative">
                <div className="flex flex-nowrap md:justify-center gap-3 md:gap-4 px-6 md:px-8 py-4 bg-white/60 backdrop-blur-2xl rounded-full border border-white/40 shadow-2xl w-full mx-auto ring-1 ring-black/5 overflow-x-auto no-scrollbar snap-x scroll-smooth">
                  {tabs.map(tb => (
                    <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                      className={`flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-xs md:text-sm transition-all duration-300 whitespace-nowrap snap-center
                        ${activeTab===tb.id
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-[#F07B3C] text-white shadow-xl scale-110 transform border-none z-10'
                          : 'text-hbm-gray hover:text-[#F07B3C] hover:bg-white/40'
                        }`}>
                      <tb.icon size={16} className={activeTab===tb.id ? 'text-white' : ''}/>{t(tb.label,lang)}
                    </button>
                  ))}
                </div>
                {/* Scroll Indicator for mobile */}
                <div className="md:hidden flex justify-center mt-4 gap-1.5 opacity-40">
                   {tabs.map(tb => (
                     <div key={tb.id} className={`h-1 rounded-full transition-all duration-300 ${activeTab === tb.id ? 'w-6 bg-hbm-purple' : 'w-2 bg-gray-400'}`} />
                   ))}
                </div>
              </div>
            </div>

            {/* Content Area - FIXED MIN-HEIGHT TO PREVENT JUMPING */}
            <div className="min-h-[600px] pt-20 md:pt-0 mb-20 relative z-10">
              <AnimatePresence mode="wait">
                {currentTab && (
                  <motion.div 
                      key={currentTab.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <div className="text-center mb-10 md:mb-16">
                      <h2 className="text-3xl md:text-5xl font-bold font-['Sora'] text-hbm-dark mb-4 leading-tight drop-shadow-sm">
                          {t(currentTab.headline,lang)}
                      </h2>
                      {currentTab.subtitle && (
                        <p className="text-lg md:text-xl text-gray-900 font-['Sofia_Pro'] max-w-3xl mx-auto leading-relaxed font-semibold px-4">
                          {t(currentTab.subtitle,lang)}
                        </p>
                      )}
                    </div>
                    
                    {/* The 3-Point Grid with Wobble Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch relative z-20">
                      {currentTab.points.map((item,i) => (
                        <WobbleCard 
                          key={i} 
                          containerClassName="h-full bg-white/95 backdrop-blur-md border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl md:!rounded-3xl !overflow-hidden relative group z-20"
                          className="p-6 md:p-8 h-full flex flex-col justify-start relative z-20"
                        >
                           <div className="mb-4 md:mb-6 flex-shrink-0 relative z-10">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#F07B3C]/10 flex items-center justify-center text-[#F07B3C] border border-[#F07B3C]/20 backdrop-blur-sm">
                                  {item.icon && <item.icon size={24} strokeWidth={1.5} />}
                              </div>
                           </div>
                           <h3 className="font-bold font-['Sora'] text-hbm-dark text-lg md:text-xl mb-2 md:mb-3 leading-tight relative z-10 min-h-[3rem] flex items-end pb-1">
                              {t(item.bold,lang)}
                           </h3>
                           <p className="text-gray-900 font-['Sofia_Pro'] leading-relaxed text-sm md:text-base relative z-10 flex-grow font-medium">
                              {t(item.text,lang)}
                           </p>
                        </WobbleCard>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </BubbleContainer>
      </section>

      {/* Lead Generation CTA */}
      <LeadGenCTA />

      {/* Success Stories (Classic Centered Design in Looping Marquee) */}
      {testimonialsList.length > 0 && (
        <section className="relative z-10 py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <EyebrowBadge text={lang === 'he' ? 'סיפורי הצלחה' : 'SUCCESS STORIES'} />
            <h2 className="text-4xl md:text-5xl font-black text-hbm-purple mt-4">{t({en:'Real Impact.',he:'השפעה אמיתית.'},lang)}</h2>
          </div>

          <div className="relative w-full overflow-hidden mask-gradient-x">
             <div className="flex gap-8 w-max animate-marquee hover:[animation-play-state:paused]" style={{ animationDuration: '50s' }}>
                {[...testimonialsList, ...testimonialsList, ...testimonialsList, ...testimonialsList].map((t, i) => (
                  <div key={i} className="w-[320px] md:w-[400px] bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center shrink-0">
                    {/* Centered Stars */}
                    <div className="flex gap-1 mb-6 justify-center">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={18} className="text-hbm-orange fill-hbm-orange" />
                      ))}
                    </div>

                    {/* Centered Quote */}
                    <p className="text-hbm-dark font-medium italic mb-8 leading-relaxed font-['Sofia_Pro'] text-lg">
                      "{t.quote}"
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-gray-100 mb-6" />

                    {/* Centered Author Info */}
                    <div className="flex flex-col items-center">
                      <h4 className="font-bold text-hbm-dark text-lg font-['Sora']">{t.author}</h4>
                      <p className="text-xs text-hbm-gray uppercase tracking-widest font-['Sofia_Pro'] mt-1">
                        {t.role}
                      </p>
                    </div>

                    {/* Optional Company Logo - Small and discrete at the bottom if exists */}
                    {t.companyLogo && (
                      <img src={t.companyLogo} alt="Company" className="h-4 object-contain opacity-20 grayscale mt-4" />
                    )}
                  </div>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* Trusted Partners Section */}
      <section id="partners-meeter" className="bg-hbm-cream pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-400 text-xs uppercase tracking-[0.2em] mb-12 font-bold">
            {t({ en: 'Trusted Partners', he: 'שותפים מהימנים' }, lang)}
          </p>
          
          <div className="relative w-full overflow-hidden mask-gradient-x">
            <div className="flex gap-12 md:gap-24 items-center w-max animate-marquee" style={{ paddingLeft: '2rem', animationDuration: '30s' }}>
              {[...partnerLogosList, ...partnerLogosList, ...partnerLogosList, ...partnerLogosList].map((partner, i) => (
                <div key={i} className="flex-shrink-0 h-32 md:h-40 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300">
                  <img 
                    src={partner.logoUrl || partner.src} 
                    alt={partner.name}
                    className="h-full w-auto object-contain transition-all duration-300 hover:scale-110"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bridge to Features */}
      <NextPageBridge 
        to="/meeter/features"
        eyebrow={{ en: 'How It Works', he: 'איך זה עובד' }}
        title={{ en: 'Explore Features', he: 'גלו פיצ\'רים' }}
        description={{ en: 'Understand the features that make genuine connection possible.', he: 'הבינו את הפיצ\'רים שמאפשרים חיבור אמיתי.' }}
        buttonText={{ en: 'Explore Features', he: 'גלו פיצ\'רים' }}
      />
    </div>
  )
}
