import React from "react";
import { Link } from "react-router-dom";
import { useI18n, t } from "../i18n/context.jsx";
import { ui } from "../i18n/translations.js";

function ErrorFallback() {
  const { lang } = useI18n();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 bg-[#FAF9F5]">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-gray-800 mb-2">
          {t(ui.common.errorTitle, lang)}
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          {t(ui.common.errorMessage, lang)}
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-4 bg-[#6160AB] text-white font-bold rounded-xl hover:bg-[#5050a0] transition-colors"
        >
          {t(ui.common.backToHome, lang)}
        </Link>
      </div>
    </div>
  );
}

class PageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("PageErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
