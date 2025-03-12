// app/page.tsx - Server Component
import { Star, Users, FileText } from "lucide-react";
import Link from "next/link";
import ResumeUploader from "./components/ResumeUploader";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f3e3]">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-6xl font-bold">
          <span className="text-[#2d6a41]">Slug</span>
          <span className="text-[#97ca3f]">Labs</span>
        </h1>
        <p className="mt-4 text-xl text-[#5a7260] max-w-2xl mx-auto px-4">
          Connect with cutting-edge research labs using our AI-powered matching
          system
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-3xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Action Buttons */}
            <div className="flex-1 flex gap-4">
              <button className="flex-1 bg-[#97ca3f] text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                <FileText size={20} />
                <span className="font-medium">Match Me</span>
              </button>
              <Link href="/directory" className="flex-1">
                <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                  <span className="font-medium">Browse Labs</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Upload Resume */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#2d6a41] mb-4">
              Upload Your Resume
            </h2>
            {/* Client Component for file upload */}
            <ResumeUploader />
          </div>

          {/* Right Column - Top Matches */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#2d6a41]">Top Matches</h2>
              <a href="#" className="text-[#97ca3f] font-medium">
                View All
              </a>
            </div>

            {/* Match Cards */}
            <div className="space-y-4">
              {/* Match Card 1 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="bg-[#f0f9e8] p-2 rounded-lg">
                      <Star className="h-6 w-6 text-[#97ca3f]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#2d6a41]">
                        Quantum Computing Lab 1
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Research focus on quantum algorithms and quantum machine
                        learning. Strong emphasis on theoretical foundations.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <span className="bg-[#f0f9e8] text-[#2d6a41] px-3 py-1 rounded-full text-sm">
                          Quantum Computing
                        </span>
                        <span className="bg-[#f5f0e0] text-[#8a7e55] px-3 py-1 rounded-full text-sm">
                          Machine Learning
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#f0f9e8] text-[#2d6a41] px-3 py-1 rounded-full text-sm font-medium">
                      95% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Card 2 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="bg-[#f0f9e8] p-2 rounded-lg">
                      <Users className="h-6 w-6 text-[#97ca3f]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#2d6a41]">
                        Quantum Computing Lab 2
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Research focus on quantum algorithms and quantum machine
                        learning. Strong emphasis on theoretical foundations.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <span className="bg-[#f0f9e8] text-[#2d6a41] px-3 py-1 rounded-full text-sm">
                          Quantum Computing
                        </span>
                        <span className="bg-[#f5f0e0] text-[#8a7e55] px-3 py-1 rounded-full text-sm">
                          Machine Learning
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#f0f9e8] text-[#2d6a41] px-3 py-1 rounded-full text-sm font-medium">
                      90% Match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
