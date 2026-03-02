import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-gray-100 text-gray-700 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-semibold text-lg">SLIIT-UniRide</div>
        <div className="text-sm">© {year} SLIIT-UniRide. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;