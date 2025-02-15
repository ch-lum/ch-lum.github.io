"use client";
import { useEffect } from "react";

export default function CVPage() {
  useEffect(() => {
    // Redirect to PDF file
    window.location.href = "/documents/christopher-lum-cv.pdf";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading CV...</p>
    </div>
  );
}
