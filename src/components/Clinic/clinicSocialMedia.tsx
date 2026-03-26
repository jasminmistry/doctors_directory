"use client";

import { Facebook, Instagram, Twitter, Youtube, Mail, ExternalLink } from "lucide-react";

type Clinic = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  email?: string;
  website?: string;
};

export default function SocialMediaIcons({ clinic }: Readonly<{ readonly clinic: Clinic }>) {
  return (
    <nav aria-label="Social media links" className="flex flex-row flex-wrap gap-3 items-center justify-center mt-2">
      {clinic.facebook && (
        <a
          href={clinic.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="inline-flex"
        >
          <Facebook
            aria-hidden="true"
            className="h-5 w-5 text-black hover:text-black transition-colors"
          />
        </a>
      )}
      {clinic.instagram && (
        <a
          href={clinic.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="inline-flex"
        >
          <Instagram
            aria-hidden="true"
            className="h-5 w-5 text-black hover:text-black transition-colors"
          />
        </a>
      )}
      {clinic.twitter && (
        <a
          href={clinic.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="inline-flex"
        >
          <Twitter
            aria-hidden="true"
            className="h-5 w-5 text-black hover:text-black transition-colors"
          />
        </a>
      )}
      {clinic.youtube && (
        <a
          href={clinic.youtube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          className="inline-flex"
        >
          <Youtube
            aria-hidden="true"
            className="h-5 w-5 text-black hover:text-black transition-colors"
          />
        </a>
      )}
      {clinic.email && (
        <a
          href={clinic.email.includes("@") && !clinic.email.startsWith("mailto:") ? `mailto:${clinic.email}` : clinic.email}
          aria-label="Email"
          className="inline-flex"
        >
          <Mail
            aria-hidden="true"
            className="h-5 w-5 text-black hover:text-amber-500 transition-colors"
          />
        </a>
      )}
      {clinic.website && (
        <a
          href={clinic.website.replace(/^\.+|\.+$/g, '')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Website"
          className="inline-flex"
        >
          <ExternalLink
            aria-hidden="true"
            className="h-5 w-5 text-black hover:text-gray-800 transition-colors"
          />
        </a>
      )}
    </nav>
  );
}
