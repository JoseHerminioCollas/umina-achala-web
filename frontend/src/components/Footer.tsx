// src/components/Footer.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerLinks}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            isActive ? `${styles.footerLink} ${styles.active}` : styles.footerLink
          }
        >
          Marketplace
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          About
        </NavLink>
        <NavLink
          to="/faqs"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          FAQs
        </NavLink>
        <NavLink
          to="/privacy"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          Privacy & Cookies
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          Contact
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          Admin NFT
        </NavLink>
        <NavLink
          to="/compliance"
          className={({ isActive }) =>
            isActive
              ? `${styles.footerLink} ${styles.active}`
              : styles.footerLink
          }
        >
          Compliance Dashboard
        </NavLink>
      </div>
      <div className={styles.footerCopy}>
        © 2026 Rumi Project. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
