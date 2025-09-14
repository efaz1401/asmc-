import React, { useState } from "react";

const BlogSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const pdfUrl = "/lovable-uploads/Adel Profile updated.pdf";

  return (
    <section id="achievements" className="section-container bg-muted/30">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="company-chip mb-6">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground mr-2">05</span>
          <span>Company Achievements</span>
        </div>
        
        <h2 className="section-title mb-6">
          Our Proud Accomplishments
        </h2>
        
        <p className="section-subtitle text-center">
          We are proud to share our company profile, which details our journey, services, and successes.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="glass-card overflow-hidden transition-all duration-300 w-full">
          <div className="p-4 sm:p-6">
            {isLoading && (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-700 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-40 bg-slate-700 rounded"></div>
                </div>
              </div>
            )}
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              onLoad={() => setIsLoading(false)}
              className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{ border: 'none' }}
              title="Company Profile"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;