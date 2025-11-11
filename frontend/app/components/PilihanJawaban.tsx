import React from 'react';

type Props = {
  choices: string[];
  name?: string;
  value?: string | null;
  onSelect?: (value: string) => void;
};

export default function PilihanJawaban({ choices, name = 'pilihan', value = null, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {choices.map((c, i) => (
        <label key={i} className="block border border-blue-200 rounded-md px-4 py-3 cursor-pointer hover:bg-blue-50 transition">
          <input
            type="radio"
            name={name}
            className="mr-3 accent-blue-500"
            checked={value === c}
            onChange={() => onSelect && onSelect(c)}
          />
          {c}
        </label>
      ))}
    </div>
  );
}
