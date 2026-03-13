import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Linkedin, User } from "lucide-react";
import { siteContent } from "../data/content";
import { useI18n, t } from "../i18n/context";
import { getApiBase } from "../utils/api";
import SEO from "../components/SEO";
import { ui } from "../i18n/translations";

const defaultTeam = Array.isArray(siteContent?.about?.team?.members) ? siteContent.about.team.members : [];
const about = siteContent?.about;

function slugify(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export default function TeamMember() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [teamMembers, setTeamMembers] = useState(defaultTeam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBase()}/api/site-content`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.team?.length) {
          const staticMembers = about?.team?.members ?? defaultTeam;
          const merged = data.team.map((member) => {
            const staticMatch = staticMembers.find((sm) => sm && sm.name === member.name);
            if (staticMatch) {
              if (!member.image && !member.imageUrl) member.image = staticMatch.image;
              if (member.bio === undefined || member.bio === "") member.bio = staticMatch.bio;
              if (member.funFact === undefined || member.funFact === "") member.funFact = staticMatch.funFact;
              if (member.funFacts === undefined && staticMatch.funFacts) member.funFacts = staticMatch.funFacts;
            }
            return member;
          });
          setTeamMembers(merged);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const member = teamMembers.find((m) => m && slugify(m.name) === slug);
  const notFound = !loading && !member;

  const descriptionText = member
    ? (() => {
        if (typeof member.bio === "string") return member.bio.slice(0, 200);
        if (Array.isArray(member.bio)) {
          const raw = t(member.bio, lang);
          const str = Array.isArray(raw) ? raw[0] : raw;
          return (typeof str === "string" ? str : "").slice(0, 200);
        }
        if (member.bio && typeof member.bio === "object") {
          const s = member.bio[lang] || member.bio.en || member.bio.he;
          return (typeof s === "string" ? s : "").slice(0, 200);
        }
        if (member.mantra || member.funFact) {
          const m = typeof member.mantra === "string" ? member.mantra : t(member.mantra, lang);
          const f = typeof member.funFact === "string" ? member.funFact : t(member.funFact, lang);
          return (m || f || "").slice(0, 200);
        }
        return `${member.name} | The HBM Team`;
      })()
    : "";

  if (loading && !member) {
    return (
      <div className="min-h-screen bg-hbm-cream flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-hbm-purple/20 border-t-hbm-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-hbm-cream flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-black text-gray-700 mb-4">{t(ui.events.eventNotFound, lang)}</h1>
        <p className="text-gray-500 mb-6">{lang === "he" ? "חבר צוות לא נמצא." : "Team member not found."}</p>
        <Link to="/about" className="text-hbm-purple font-bold hover:underline">
          ← {t(ui.about.backToAbout, lang)}
        </Link>
      </div>
    );
  }

  const roleText = typeof member.role === "string" ? member.role : t(member.role, lang);
  const imageUrl = member.image || member.imageUrl;

  return (
    <div className="min-h-screen bg-hbm-cream">
      <SEO
        title={`${member.name} | The HBM`}
        description={descriptionText || `${member.name} — ${roleText}. The Human Being Movement.`}
        image={imageUrl}
        type="profile"
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/about")}
          className="flex items-center gap-2 text-hbm-purple font-bold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {t(ui.about.backToAbout, lang)}
        </button>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 relative bg-gray-100 shrink-0">
            <div className="aspect-[3/4] md:aspect-square md:min-h-[400px] relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hbm-purple/10 to-hbm-orange/10 text-hbm-purple/40">
                  <User size={120} />
                </div>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-12 h-12 bg-[#0077B5] rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                >
                  <Linkedin size={24} />
                </a>
              )}
            </div>
          </div>
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-hbm-dark mb-2">{member.name}</h1>
            <p className="text-hbm-purple font-bold uppercase tracking-widest text-sm mb-6">{roleText}</p>
            {member.nickname && (
              <p className="text-gray-500 italic mb-4">
                "{typeof member.nickname === "string" ? member.nickname : t(member.nickname, lang)}
                "
              </p>
            )}
            <div className="space-y-4">
              <p className="text-sm font-bold text-hbm-orange">{lang === "he" ? "ביו" : "Bio"}:</p>
              {typeof member.bio === "string" ? (
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              ) : Array.isArray(member.bio) ? (
                (t(member.bio, lang) || []).map((para, idx) => (
                  <p key={idx} className="text-gray-600 leading-relaxed mb-2">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-gray-600 leading-relaxed">{t(member.bio, lang)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
