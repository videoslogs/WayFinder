
import React from 'react';

export const AdPlaceholder = () => (
  <div className="w-full my-4 relative overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 flex flex-col items-center justify-center text-center">
    <span className="absolute top-1 right-2 text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-800 px-1 rounded">Ad</span>
    <div className="py-6 px-4">
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sponsored Content</p>
      <p className="text-xs text-gray-500 mt-1">Discover travel deals and local offers here.</p>
    </div>
    {/* Google AdSense Script Placeholder */}
    {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> */}
  </div>
);
