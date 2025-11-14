"use client";

import React from "react";
import Graphic from "../../../../../components/graphic";
import { useState } from "react";
import MobileMenu from "./mobile-menu";

const MobileMenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 right-3 z-40 bg-background rounded-bl-[18px] lg:hidden cursor-pointer select-none"
      >
        <div className="relative pb-3 px-4">
          <h1 className="text-sm font-light">Menu</h1>
          <Graphic className="absolute -bottom-4 right-0 rotate-90" />
          <Graphic className="absolute -left-4 top-0 rotate-90" />
        </div>
      </button>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default MobileMenuButton;
