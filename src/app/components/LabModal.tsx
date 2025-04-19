// components/LabModal.tsx
"use client";

import React from "react";

interface Lab {
  id: number;
  Department: string;
  "Professor Name": string;
  Contact: string;
  "Lab Name": string;
  Major: string;
  "How to apply": string;
  Description: string;
  match_reason?: string;
  similarity_score?: number;
}

interface LabModalProps {
  lab: Lab;
  onClose: () => void;
}

export default function LabModal({ lab, onClose }: LabModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-[#2d6a41] mb-4">{lab["Lab Name"]}</h2>
        <p className="text-gray-600">{lab.Description}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-[#97ca3f] text-white py-2 px-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}