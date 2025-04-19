"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface Lab {
  id: number;
  Department: string;
  "Professor Name": string;
  Contact: string;
  "Lab Name": string;
  Major: string;
  "How to apply": string;
  Description: string;
}

interface LabAnalysis extends Lab {
  match_reason?: string;
  similarity_score?: number;
}

interface ResumeDetails {
  major: string;
  keywords: string;
}

interface ResumeUploaderProps {
  onLabsFound: (labs: LabAnalysis[]) => void; // Callback to pass labs to parent
}

export default function ResumeUploader({ onLabsFound }: ResumeUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labs, setLabs] = useState<LabAnalysis[]>([]);

  // Load labs from localStorage on component mount
  useEffect(() => {
    const savedLabs = localStorage.getItem("savedLabs");
    if (savedLabs) {
      const parsedLabs = JSON.parse(savedLabs);
      setLabs(parsedLabs);
    }
  }, []); // <-- Empty dependency array ensures this runs only once on mount

  // Save labs to localStorage whenever labs state changes
  useEffect(() => {
    if (labs.length > 0) {
      localStorage.setItem("savedLabs", JSON.stringify(labs));
    }
  }, [labs]); // <-- Only runs when `labs` changes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type === "image/png" ||
        file.type === "image/jpeg")
    ) {
      setSelectedFile(file);
      fileRef.current = file;
      console.log("Selected file:", file);
    } else {
      alert("Please upload a valid PDF, PNG, or JPEG file.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    fileRef.current = null;
  };

  const processFileAndFetchLabs = async () => {
    const file = fileRef.current;
    if (!file) {
      setError("Please upload a file");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result?.toString();
          if (!result) return reject("Failed to read file");
          resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject("Error reading file");
        reader.readAsDataURL(file);
      });

      const resumeResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "Extract the academic major and key skills or research interests from this document. The document will either be a resume or a transcript for a student at UC Santa Cruz who is interested in lab opportunities. Parse through the document to understand the student's skills, interests, background, and experience to find the best labs for them. Respond in the format: Major: <major>\nKeywords: <comma-separated keywords>.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Analyze this document and extract the most relevant academic major along with additional keywords that represent skills or interests for the given student's resume or transcript.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${b64}`,
                  detail: "auto",
                },
              },
            ],
          },
        ],
        max_tokens: 150,
      });

      const resumeContent =
        resumeResponse.choices[0]?.message?.content?.trim();
      if (!resumeContent) throw new Error("Failed to extract resume details");

      const majorMatch = resumeContent.match(/Major:\s*(.+)/);
      const keywordsMatch = resumeContent.match(/Keywords:\s*(.+)/);

      if (!majorMatch || !keywordsMatch) {
        throw new Error("Failed to parse document details");
      }

      const resumeDetails: ResumeDetails = {
        major: majorMatch[1].trim(),
        keywords: keywordsMatch[1].trim(),
      };

      const { data: allLabs, error: supabaseError } = await supabase
        .from("labconnect")
        .select();
      if (supabaseError) throw supabaseError;
      if (!allLabs?.length) throw new Error("No labs found");

      const comparisonResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the following details about a UC Santa Cruz student and compare them with these lab descriptions. For each lab in the list, provide:
- A similarity score (an integer between 1 and 5).
- A concise match reason (no more than about 20 words) explaining why the lab is a good match for the student.
Strongly consider the applicant's major ("${resumeDetails.major}") and keywords ("${resumeDetails.keywords}") when performing your analysis.
Respond in the following exact format for each lab: 
Lab ID: <id>
Similarity Score: <score>
Match Reason: <reason>
---`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Details:
Major: ${resumeDetails.major}
Keywords: ${resumeDetails.keywords}

Lab Descriptions:
${JSON.stringify(allLabs, null, 2)}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${b64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const analysisContent =
        comparisonResponse.choices[0]?.message?.content;
      if (!analysisContent)
        throw new Error("Failed to get lab analysis from LLM");

      const labAnalysis = analysisContent
        .split("---")
        .map((block) => {
          const idMatch = block.match(/Lab\s*ID:\s*(\d+)/i);
          const scoreMatch = block.match(/Similarity\s*Score:\s*(\d+)/i);
          const reasonMatch = block.match(/Match\s*Reason:\s*([\s\S]+)/i);
          if (!idMatch || !scoreMatch || !reasonMatch) return null;
          return {
            id: parseInt(idMatch[1]),
            similarity_score: parseInt(scoreMatch[1]),
            match_reason: reasonMatch[1].trim(),
          };
        })
        .filter((lab) => lab !== null) as {
        id: number;
        similarity_score: number;
        match_reason: string;
      }[];

      const enhancedLabs = allLabs.map((lab: LabAnalysis) => {
        const analysis = labAnalysis.find((l) => l.id === lab.id);
        return {
          ...lab,
          similarity_score: analysis ? analysis.similarity_score : 0,
          match_reason: analysis ? analysis.match_reason : "No match details provided.",
        };
      }).sort(
        (a: LabAnalysis, b: LabAnalysis) =>
          (b.similarity_score || 0) - (a.similarity_score || 0)
      );

      const highMatchLabs = enhancedLabs.filter(
        (lab: LabAnalysis) => lab.similarity_score && lab.similarity_score >= 4
      );

      // Update local state and localStorage
      setLabs(highMatchLabs);
      onLabsFound(highMatchLabs); // Pass labs to parent
    } catch (err) {
      console.error("Error processing file:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="bg-[#97ca3f] text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="font-medium">Upload Resume</span>
        </label>
        {selectedFile && (
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <span className="text-sm">{selectedFile.name}</span>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <button
        onClick={processFileAndFetchLabs}
        className="w-full bg-[#2d6a41] text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2"
        disabled={loading || !selectedFile}
      >
        {loading ? "Analyzing..." : "Find Matching Labs"}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}