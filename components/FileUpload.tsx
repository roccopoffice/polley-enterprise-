"use client";

import { Upload } from "lucide-react";

type FileUploadProps = {
  id: string;
  label: string;
  helpText?: string;
  onChange: (fileName: string) => void;
};

export function FileUpload({ id, label, helpText, onChange }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-enterprise-charcoal">
        {label}
      </label>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-enterprise-border bg-white px-4 py-3 text-sm text-enterprise-gray hover:border-enterprise-blue hover:bg-enterprise-light"
      >
        <Upload className="h-4 w-4 text-enterprise-blue" />
        <span>Choose file</span>
      </label>
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={(event) => {
          const fileName = event.target.files?.[0]?.name || "";
          onChange(fileName);
        }}
      />
      {helpText ? <p className="text-xs text-enterprise-gray">{helpText}</p> : null}
    </div>
  );
}
