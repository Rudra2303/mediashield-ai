"use client";

import { useState } from "react";
import Image from "next/image";

type AnalysisData = Record<string, unknown>;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  // Upload image to Cloudinary
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Upload response:", data);

      if (!response.ok) {
        setMessage(
          typeof data?.error === "string"
            ? data.error
            : "Upload failed."
        );
        return;
      }

      if (!data.secure_url) {
        setMessage("Cloudinary did not return an image URL.");
        return;
      }

      setImageUrl(data.secure_url);
      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Analyze image with Cloudinary AI
  const handleAnalyze = async () => {
    if (!imageUrl) {
      setMessage("Please upload an image first.");
      return;
    }

    setAnalyzing(true);
    setMessage("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
        }),
      });

      const data = await response.json();

      console.log("AI response:", data);

      if (!response.ok) {

        const actualError =
          typeof data?.details?.error?.message === "string"
            ? data.details.error.message
            : typeof data?.details?.message === "string"
              ? data.details.message
              : typeof data?.error === "string"
                ? data.error
                : "Cloudinary AI request failed.";

        setMessage(actualError);
        return;
      }

      setAnalysis(data);
      setMessage("AI analysis completed successfully!");
    } catch (error) {
      console.error("AI analysis error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "AI analysis failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setImageUrl("");
    setAnalysis(null);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* Header */}
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Cloudinary Hackathon
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            MediaShield AI
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Intelligent media analysis, transformation and optimization
            powered by Cloudinary.
          </p>
        </div>

        {/* Upload Card */}
        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <h2 className="text-2xl font-semibold">
            Upload your image
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Upload your media to Cloudinary for AI-powered analysis.
          </p>

          <div className="mt-8 rounded-xl border-2 border-dashed border-slate-700 p-8 text-center">

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const selectedFile =
                  event.target.files?.[0] || null;

                setFile(selectedFile);
                setImageUrl("");
                setAnalysis(null);
                setMessage("");
              }}
              className="block w-full text-sm text-slate-300"
            />

            {/* Selected File */}
            {file && (
              <p className="mt-4 text-sm text-cyan-400">
                Selected: {file.name}
              </p>
            )}

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-6 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "Upload to Cloudinary"}
            </button>

            {/* Message */}
            {message && (
              <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4">
                <p className="text-sm text-slate-300">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Image */}
        {imageUrl && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-4 text-xl font-semibold">
              Uploaded Image
            </h2>

            <div className="overflow-hidden rounded-xl">
              <Image
                src={imageUrl}
                alt="Uploaded media"
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>

            {/* AI Analyze Button */}
            <a
            href={imageUrl.replace(
            "/upload/",
            "/upload/f_auto,q_auto,w_800/"
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full rounded-lg border border-cyan-500 px-6 py-3 text-center font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
        >
          View Optimized Image
        </a>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-6 w-full rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing
                ? "Analyzing with AI..."
                : "Analyze with AI"}
            </button>

            {/* Cloudinary URL */}
            <div className="mt-5 rounded-lg bg-slate-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cloudinary Media URL
              </p>

              <p className="mt-2 break-all text-xs text-slate-400">
                {imageUrl}
              </p>
            </div>
          </div>
        )}

        {/* AI Results */}
        {analysis && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-purple-500/30 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-purple-400">
                  AI Media Analysis
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Cloudinary AI analysis results
                </p>
              </div>

              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                AI
              </span>
            </div>

            {/* AI Response */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Reset */}
        {(file || imageUrl || analysis) && (
          <div className="mx-auto mt-6 max-w-xl text-center">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-900 hover:text-white"
            >
              Upload another image
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-600">
          MediaShield AI • Built with Next.js + Cloudinary
        </footer>

      </div>
    </main>
  );
}