import React from 'react';
import { legalContent } from '../data/legal';
import { useI18n, t } from '../i18n/context';
import SEO from '../components/SEO';

/**
 * Standalone legal pages for GCP/verification and external links.
 * Routes: /termsofuse, /privacypolicy — content from legal.js (Last updated: February 23, 2026).
 */
export default function LegalPage({ type }) {
  const { lang } = useI18n();
  const legal = type ? legalContent[type] : null;

  if (!legal) {
    return (
      <div className="min-h-screen bg-hbm-cream pt-24 pb-20 flex items-center justify-center">
        <p className="text-gray-500">Page not found.</p>
      </div>
    );
  }

  const title = t(legal.title, lang);
  const path = type === 'terms' ? '/termsofuse' : '/privacypolicy';

  return (
    <div className="min-h-screen bg-hbm-cream pt-20 pb-20">
      <SEO path={path} title={title} description={type === 'terms' ? 'Terms of use for The HBM website and services.' : 'The HBM privacy policy. How we collect, use, and protect your personal information.'} />
      <article className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <header className="p-8 md:p-12 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-bold text-hbm-purple font-sofia">
              {title}
            </h1>
          </header>
          <div
            className="p-8 md:p-12 prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-2xl prose-h3:text-xl prose-h3:mt-8 prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:text-gray-600 prose-li:leading-relaxed font-sofia"
            dangerouslySetInnerHTML={{ __html: legal.content }}
          />
        </div>
      </article>
    </div>
  );
}
