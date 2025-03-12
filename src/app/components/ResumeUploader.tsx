"use client";

import { FileText, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";

// Define proper types for the file object
interface FileState {
  name: string;
  size: number;
}

export default function ResumeUploader() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<FileState | null>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.type === "application/msword" ||
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setFile({
        name: droppedFile.name,
        size: droppedFile.size,
      });
    }
  }, []);

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile({
          name: selectedFile.name,
          size: selectedFile.size,
        });
      }
    },
    []
  );

  return (
    <>
      <div
        className={`border-2 border-dashed ${
          isDragging
            ? "border-[#2d6a41] bg-[#e8f5e3]"
            : "border-[#97ca3f] bg-[#f8f3e3]"
        } 
                  rounded-lg p-8 flex flex-col items-center justify-center transition-colors duration-200
                  ${file ? "border-[#2d6a41]" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <label
          htmlFor="resume-upload"
          className="cursor-pointer w-full h-full flex flex-col items-center"
        >
          {file ? (
            <>
              <div className="bg-[#2d6a41] p-4 rounded-full mb-4">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <p className="text-[#2d6a41] font-medium text-lg">
                File selected: {file.name}
              </p>
              <p className="text-[#5a7260] mt-1">
                {Math.round(file.size / 1024)} KB
              </p>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-full mb-4">
                <FileText className="h-10 w-10 text-[#2d6a41]" />
              </div>
              <p className="text-[#2d6a41] font-medium text-lg">
                {isDragging ? "Drop your resume here" : "Drop your resume here"}
              </p>
              <p className="text-[#5a7260] mt-1">or click to browse</p>
              <p className="text-[#5a7260] mt-4 text-sm">
                Accepts PDF, DOC, and DOCX files
              </p>
            </>
          )}
        </label>
      </div>
      <Link href="/directory" className="block">
        <button
          className={`w-full ${
            file ? "bg-[#2d6a41]" : "bg-[#a0b5a0]"
          } text-white py-4 rounded-lg mt-6 font-medium transition-colors duration-200`}
          disabled={!file}
        >
          Find My Lab Matches
        </button>
      </Link>
    </>
  );
}
