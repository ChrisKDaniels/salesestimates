"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CinelaunchNav = () => {
  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <a href="https://app.cinelaunch.io" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-slate-900">CINELAUNCH</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = 'https://app.cinelaunch.io'}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinelaunchNav;