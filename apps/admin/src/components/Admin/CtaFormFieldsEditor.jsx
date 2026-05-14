import React from "react";
import { normalizeCtaFormFields } from "../../../../../lib/cta-form-fields.js";

const ROWS = [
  { key: "name", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "source", label: "Referral / source" },
  { key: "terms", label: "Terms & privacy checkbox" },
  { key: "marketing", label: "Marketing opt-in" },
];

export default function CtaFormFieldsEditor({
  value,
  legacyRegistrationFields,
  onChange,
  className = "",
}) {
  const fields = normalizeCtaFormFields(value ?? {}, legacyRegistrationFields ?? null);

  const patch = (key, partial) => {
    const next = normalizeCtaFormFields(
      { ...fields, [key]: { ...fields[key], ...partial } },
      null,
    );
    onChange(next);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-[10px] font-bold text-gray-500 leading-snug">
        Control which fields appear on the registration CTA and whether each is required.
        At least one contact field (name, email, or phone) must stay required.
      </p>
      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-white/80">
          <span>Field</span>
          <span className="text-center">Show</span>
          <span className="text-center">Req</span>
        </div>
        {ROWS.map(({ key, label }) => {
          const row = fields[key];
          return (
            <div
              key={key}
              className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-3 py-2.5 border-b border-gray-100 last:border-b-0 bg-white/60"
            >
              <span className="text-xs font-bold text-gray-800">{label}</span>
              <label className="flex justify-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  checked={row.show}
                  onChange={(e) =>
                    patch(key, {
                      show: e.target.checked,
                      required: e.target.checked ? row.required : false,
                    })
                  }
                />
              </label>
              <label className="flex justify-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  checked={row.required}
                  disabled={!row.show}
                  onChange={(e) => patch(key, { required: e.target.checked })}
                />
              </label>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
        onClick={() => onChange(normalizeCtaFormFields({}, null))}
      >
        Reset to defaults
      </button>
    </div>
  );
}
