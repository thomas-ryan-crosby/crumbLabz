"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolioProjects, type Project } from "@/lib/firebase";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

// The subset of Project fields the portfolio UI actually renders. Both the
// Firestore-backed projects and the hand-curated featured projects below
// satisfy this shape, so they share the same card and modal markup.
type DisplayProject = {
  id: string;
  name: string;
  companyName: string;
  status: Project["status"];
  portfolioDescription: string;
  portfolioBenefits: string;
  portfolioContent: string;
};

// Static, non-interactive HTML showcases shown in each featured project's
// detail modal — hand-built to mirror each app's real UI (colors, labels,
// columns), mirroring the format of the AI-generated showcases used by the
// Firestore-backed projects. All sample data is illustrative.
const GSCP_SHOWCASE = `
<div style="pointer-events:none;cursor:default;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141414;">
  <div style="background:#eef2f6;border:1px solid #dce3ec;border-bottom:none;border-radius:10px 10px 0 0;padding:7px 12px;display:flex;align-items:center;gap:6px;">
    <span style="width:9px;height:9px;border-radius:50%;background:#c0392b;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#c9892a;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#7cb34a;display:inline-block;"></span>
    <span style="margin-left:8px;font-size:11px;color:#5a6470;background:#fff;border:1px solid #dce3ec;border-radius:6px;padding:3px 10px;">gulfsouthcommercepark.com</span>
  </div>
  <div style="border:1px solid #dce3ec;border-radius:0 0 10px 10px;background:#f5f7fa;padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;">
      <div>
        <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#329A9A;font-weight:700;">Campaign Tracker</div>
        <div style="font-size:17px;font-weight:700;color:#003459;">Gulf South <span style="color:#7cb34a;">Commerce Park</span></div>
      </div>
      <div style="font-size:10px;color:#5a6470;text-align:right;line-height:1.5;">
        <div>Initiative · <span style="color:#003459;font-weight:600;">Secured Truck Parking</span></div>
        <div>Owner · <span style="color:#003459;font-weight:600;">Ryan Crosby</span></div>
      </div>
    </div>
    <div style="display:flex;gap:7px;margin-bottom:14px;">
      <div style="flex:1;background:#fff;border:1px solid #dce3ec;border-left:3px solid #003459;border-radius:7px;padding:7px 9px;"><div style="font-size:17px;font-weight:700;">42</div><div style="font-size:8px;color:#5a6470;text-transform:uppercase;letter-spacing:.03em;">Total</div></div>
      <div style="flex:1;background:#fff;border:1px solid #dce3ec;border-left:3px solid #c9892a;border-radius:7px;padding:7px 9px;"><div style="font-size:17px;font-weight:700;">9</div><div style="font-size:8px;color:#5a6470;text-transform:uppercase;letter-spacing:.03em;">Awaiting</div></div>
      <div style="flex:1;background:#fff;border:1px solid #dce3ec;border-left:3px solid #7cb34a;border-radius:7px;padding:7px 9px;"><div style="font-size:17px;font-weight:700;">21</div><div style="font-size:8px;color:#5a6470;text-transform:uppercase;letter-spacing:.03em;">Pursuing</div></div>
      <div style="flex:1;background:#fff;border:1px solid #dce3ec;border-left:3px solid #329A9A;border-radius:7px;padding:7px 9px;"><div style="font-size:17px;font-weight:700;">7</div><div style="font-size:8px;color:#5a6470;text-transform:uppercase;letter-spacing:.03em;">Engaged</div></div>
      <div style="flex:1;background:#fff;border:1px solid #dce3ec;border-left:3px solid #c0392b;border-radius:7px;padding:7px 9px;"><div style="font-size:17px;font-weight:700;">5</div><div style="font-size:8px;color:#5a6470;text-transform:uppercase;letter-spacing:.03em;">Paused</div></div>
      <div style="flex:1;background:#fff;border:1px solid #dce3ec;border-left:3px solid #003459;border-radius:7px;padding:7px 9px;"><div style="font-size:17px;font-weight:700;">3</div><div style="font-size:8px;color:#5a6470;text-transform:uppercase;letter-spacing:.03em;">Closed</div></div>
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
      <span style="font-size:10px;background:#fff;border:1px solid #dce3ec;color:#8b95a3;border-radius:20px;padding:4px 12px;">Search company, contact, email…</span>
      <span style="font-size:10px;background:#003459;color:#fff;border-radius:20px;padding:4px 10px;">All</span>
      <span style="font-size:10px;background:#fff;border:1px solid #dce3ec;color:#5a6470;border-radius:20px;padding:4px 10px;">Pursuing</span>
      <span style="font-size:10px;background:#fff;border:1px solid #dce3ec;color:#5a6470;border-radius:20px;padding:4px 10px;">Awaiting review</span>
      <span style="font-size:10px;background:#fff;border:1px solid #dce3ec;color:#5a6470;border-radius:20px;padding:4px 10px;">Paused</span>
    </div>
    <div style="background:#fff;border:1px solid #dce3ec;border-radius:8px;overflow:hidden;font-size:11px;">
      <div style="display:flex;background:#eef2f6;color:#5a6470;font-size:9px;text-transform:uppercase;letter-spacing:.04em;padding:7px 10px;font-weight:600;">
        <div style="width:34px;">ID</div><div style="width:88px;">Pursue</div><div style="flex:1;">Company</div><div style="width:84px;">Contact</div><div style="width:104px;">Next action</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #dce3ec;">
        <div style="width:34px;color:#8b95a3;">014</div><div style="width:88px;"><span style="background:#eaf5df;color:#5a8a2f;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">Pursuing</span></div><div style="flex:1;font-weight:600;">Bayou Logistics LLC</div><div style="width:84px;color:#5a6470;">M. Authement</div><div style="width:104px;color:#5a6470;">Send rate sheet</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #dce3ec;background:rgba(201,137,42,.05);">
        <div style="width:34px;color:#8b95a3;">022</div><div style="width:88px;"><span style="background:#fbf0db;color:#c9892a;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">⏳ Awaiting</span></div><div style="flex:1;font-weight:600;">Delta Freight Co</div><div style="width:84px;color:#5a6470;">R. Singh</div><div style="width:104px;color:#c0392b;">⚠ Find email</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #dce3ec;background:rgba(152,205,103,.08);">
        <div style="width:34px;color:#8b95a3;">008</div><div style="width:88px;"><span style="background:#e6eef4;color:#003459;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">★ Closed</span></div><div style="flex:1;font-weight:600;">I-12 Haulers</div><div style="width:84px;color:#5a6470;">T. Boudreaux</div><div style="width:104px;color:#5a6470;">Onboarded</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #dce3ec;opacity:.6;">
        <div style="width:34px;color:#8b95a3;">031</div><div style="width:88px;"><span style="background:#fbe9e7;color:#c0392b;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">Paused</span></div><div style="flex:1;font-weight:600;text-decoration:line-through;">Southern Cold Storage</div><div style="width:84px;color:#5a6470;">J. Pierre</div><div style="width:104px;color:#5a6470;">Revisit Q3</div>
      </div>
    </div>
  </div>
</div>
<div style="margin-top:14px;">
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Key Features</div>
  <ul style="margin:0 0 14px 18px;padding:0;font-size:12px;color:#444;line-height:1.65;">
    <li>Live, searchable contact table with per-field human vs. agent edit tracking</li>
    <li>Real-time KPI cards and a pipeline snapshot across the whole campaign</li>
    <li>Scheduled AI routine researches new leads and drafts outreach for review</li>
    <li>Every edit saved as a committed change with a full audit trail</li>
  </ul>
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Tech Stack</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;">
    <span style="font-size:10px;background:#eef2f6;color:#003459;border:1px solid #dce3ec;border-radius:20px;padding:3px 9px;">Vanilla JS</span>
    <span style="font-size:10px;background:#eef2f6;color:#003459;border:1px solid #dce3ec;border-radius:20px;padding:3px 9px;">HTML / CSS</span>
    <span style="font-size:10px;background:#eef2f6;color:#003459;border:1px solid #dce3ec;border-radius:20px;padding:3px 9px;">Vercel</span>
    <span style="font-size:10px;background:#eef2f6;color:#003459;border:1px solid #dce3ec;border-radius:20px;padding:3px 9px;">GitHub API</span>
    <span style="font-size:10px;background:#eef2f6;color:#003459;border:1px solid #dce3ec;border-radius:20px;padding:3px 9px;">Gmail API</span>
    <span style="font-size:10px;background:#eef2f6;color:#003459;border:1px solid #dce3ec;border-radius:20px;padding:3px 9px;">Claude</span>
  </div>
  <p style="font-size:10px;color:#8b95a3;margin-top:12px;">Preview shown with sample data.</p>
</div>
`;

const HOUSEHOLD_SHOWCASE = `
<div style="pointer-events:none;cursor:default;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#20232b;">
  <div style="background:#ececf0;border:1px solid #d8d8e0;border-bottom:none;border-radius:10px 10px 0 0;padding:7px 12px;display:flex;align-items:center;gap:6px;">
    <span style="width:9px;height:9px;border-radius:50%;background:#e0726b;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#e6b450;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#5aa86a;display:inline-block;"></span>
    <span style="margin-left:8px;font-size:11px;color:#7a7a8a;background:#fff;border:1px solid #d8d8e0;border-radius:6px;padding:3px 10px;">household.sanctuary-hoa.app</span>
  </div>
  <div style="border:1px solid #d8d8e0;border-radius:0 0 10px 10px;background:#f1f1f5;padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:#3b5bdb;font-size:16px;">📍</span>
        <div>
          <div style="font-size:16px;font-weight:700;color:#20232b;">Sanctuary HOA</div>
          <div style="font-size:10px;color:#7a7a8a;">318 properties</div>
        </div>
      </div>
      <span style="font-size:10px;background:#fff;border:1px solid #d8d8e0;color:#8b8b9a;border-radius:7px;padding:5px 10px;">Search properties...</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
      <span style="font-size:10px;font-weight:600;background:#3b5bdb;color:#fff;border-radius:6px;padding:5px 10px;">Properties</span>
      <span style="font-size:10px;font-weight:500;background:#fff;border:1px solid #d8d8e0;color:#7a7a8a;border-radius:6px;padding:5px 10px;">Households</span>
      <span style="font-size:10px;font-weight:500;background:#fff;border:1px solid #d8d8e0;color:#7a7a8a;border-radius:6px;padding:5px 10px;">Residents</span>
      <span style="font-size:10px;font-weight:500;background:#fff;border:1px solid #d8d8e0;color:#7a7a8a;border-radius:6px;padding:5px 10px;">Vehicles</span>
      <span style="font-size:10px;font-weight:500;background:#fff;border:1px solid #d8d8e0;color:#7a7a8a;border-radius:6px;padding:5px 10px;">Tags</span>
      <span style="font-size:10px;font-weight:500;background:#fff;border:1px solid #d8d8e0;color:#7a7a8a;border-radius:6px;padding:5px 10px;">Log</span>
    </div>
    <div style="display:flex;gap:7px;margin-bottom:14px;">
      <div style="flex:1;background:#fafafa;border:1px solid #d8d8e0;border-radius:8px;padding:8px 10px;"><div style="font-size:18px;font-weight:700;">318</div><div style="font-size:9px;color:#7a7a8a;">Total Properties</div></div>
      <div style="flex:1;background:#fafafa;border:1px solid #d8d8e0;border-radius:8px;padding:8px 10px;"><div style="font-size:18px;font-weight:700;color:#3b5bdb;">246</div><div style="font-size:9px;color:#7a7a8a;">Built</div></div>
      <div style="flex:1;background:#fafafa;border:1px solid #d8d8e0;border-radius:8px;padding:8px 10px;"><div style="font-size:18px;font-weight:700;color:#16a34a;">72</div><div style="font-size:9px;color:#7a7a8a;">Lot Only</div></div>
      <div style="flex:1;background:#fafafa;border:1px solid #d8d8e0;border-radius:8px;padding:8px 10px;"><div style="font-size:18px;font-weight:700;color:#16a34a;">201</div><div style="font-size:9px;color:#7a7a8a;">Reviewed</div></div>
      <div style="flex:1;background:#fafafa;border:1px solid #d8d8e0;border-radius:8px;padding:8px 10px;"><div style="font-size:18px;font-weight:700;color:#d97706;">117</div><div style="font-size:9px;color:#7a7a8a;">Needs Review</div></div>
    </div>
    <div style="background:#fafafa;border:1px solid #d8d8e0;border-radius:8px;overflow:hidden;font-size:11px;">
      <div style="display:flex;background:#ececf0;color:#7a7a8a;font-size:9px;text-transform:uppercase;letter-spacing:.04em;padding:7px 10px;font-weight:600;">
        <div style="width:34px;">Lot</div><div style="flex:1;">Address</div><div style="width:58px;">Status</div><div style="width:54px;text-align:center;">Resid.</div><div style="width:48px;text-align:center;">Veh.</div><div style="width:96px;">Review</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e6e6ec;">
        <div style="width:34px;color:#8b8b9a;">12</div><div style="flex:1;font-weight:600;">🏠 142 Heron Way</div><div style="width:58px;"><span style="background:#3b5bdb;color:#fff;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">Built</span></div><div style="width:54px;text-align:center;">2</div><div style="width:48px;text-align:center;">1</div><div style="width:96px;color:#047857;font-weight:600;">✓ Reviewed</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e6e6ec;">
        <div style="width:34px;color:#8b8b9a;">13</div><div style="flex:1;font-weight:600;color:#5a6470;">🌲 Lot 13</div><div style="width:58px;"><span style="background:#ececf0;color:#5a5a68;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">Lot</span></div><div style="width:54px;text-align:center;">0</div><div style="width:48px;text-align:center;">0</div><div style="width:96px;color:#d97706;font-weight:600;">Needs Review</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e6e6ec;">
        <div style="width:34px;color:#8b8b9a;">27</div><div style="flex:1;font-weight:600;">🏠 88 Cypress Bend</div><div style="width:58px;"><span style="background:#3b5bdb;color:#fff;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">Built</span></div><div style="width:54px;text-align:center;">3</div><div style="width:48px;text-align:center;">2</div><div style="width:96px;color:#047857;font-weight:600;">✓ Reviewed</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e6e6ec;">
        <div style="width:34px;color:#8b8b9a;">41</div><div style="flex:1;font-weight:600;">🏠 5 Magnolia Ct</div><div style="width:58px;"><span style="background:#3b5bdb;color:#fff;border-radius:5px;padding:2px 7px;font-size:9px;font-weight:600;">Built</span></div><div style="width:54px;text-align:center;">1</div><div style="width:48px;text-align:center;">1</div><div style="width:96px;color:#d97706;font-weight:600;">Needs Review</div>
      </div>
    </div>
  </div>
</div>
<div style="margin-top:14px;">
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Key Features</div>
  <ul style="margin:0 0 14px 18px;padding:0;font-size:12px;color:#444;line-height:1.65;">
    <li>Unified view of properties, residents, vehicles, and entry tags</li>
    <li>Automatic detection of duplicate and overlapping household records</li>
    <li>Household merging and re-linking with primary-record selection</li>
    <li>Real-time, multi-user changelog recording every correction</li>
  </ul>
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Tech Stack</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;">
    <span style="font-size:10px;background:#eef0fb;color:#3b5bdb;border:1px solid #d8d8e0;border-radius:20px;padding:3px 9px;">Next.js</span>
    <span style="font-size:10px;background:#eef0fb;color:#3b5bdb;border:1px solid #d8d8e0;border-radius:20px;padding:3px 9px;">React 19</span>
    <span style="font-size:10px;background:#eef0fb;color:#3b5bdb;border:1px solid #d8d8e0;border-radius:20px;padding:3px 9px;">TypeScript</span>
    <span style="font-size:10px;background:#eef0fb;color:#3b5bdb;border:1px solid #d8d8e0;border-radius:20px;padding:3px 9px;">Tailwind</span>
    <span style="font-size:10px;background:#eef0fb;color:#3b5bdb;border:1px solid #d8d8e0;border-radius:20px;padding:3px 9px;">shadcn/ui</span>
    <span style="font-size:10px;background:#eef0fb;color:#3b5bdb;border:1px solid #d8d8e0;border-radius:20px;padding:3px 9px;">Firebase</span>
  </div>
  <p style="font-size:10px;color:#8b8b9a;margin-top:12px;">Preview shown with sample data.</p>
</div>
`;

const BILLING_SHOWCASE = `
<div style="pointer-events:none;cursor:default;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1f2c;">
  <div style="background:#f1f3f6;border:1px solid #e3e6ec;border-bottom:none;border-radius:10px 10px 0 0;padding:7px 12px;display:flex;align-items:center;gap:6px;">
    <span style="width:9px;height:9px;border-radius:50%;background:#e0726b;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#e6b450;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#5aa86a;display:inline-block;"></span>
    <span style="margin-left:8px;font-size:11px;color:#5a6478;background:#fff;border:1px solid #e3e6ec;border-radius:6px;padding:3px 10px;">billing.crosbymgmt.app</span>
  </div>
  <div style="border:1px solid #e3e6ec;border-radius:0 0 10px 10px;background:#fff;padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e3e6ec;padding-bottom:10px;margin-bottom:12px;">
      <span style="font-size:13px;font-weight:600;color:#2d4a7a;">Crosby Billing Approval</span>
      <span style="font-size:9px;color:#5a6478;">Dashboard · Entities · Vendors · Users</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;">
      <div>
        <div style="font-size:16px;font-weight:600;color:#1a1f2c;">Dashboard</div>
        <div style="font-size:10px;color:#5a6478;">Real-time queue across all entities.</div>
      </div>
      <span style="font-size:10px;font-weight:600;background:#2d4a7a;color:#fff;border-radius:6px;padding:5px 11px;">+ New Bill</span>
    </div>
    <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap;">
      <span style="font-size:9px;font-weight:600;background:#2d4a7a;color:#fff;border-radius:6px;padding:4px 9px;">All</span>
      <span style="font-size:9px;font-weight:500;background:#fff;border:1px solid #e3e6ec;color:#1a1f2c;border-radius:6px;padding:4px 9px;">Awaiting Approval</span>
      <span style="font-size:9px;font-weight:500;background:#fff;border:1px solid #e3e6ec;color:#1a1f2c;border-radius:6px;padding:4px 9px;">In Review</span>
      <span style="font-size:9px;font-weight:500;background:#fff;border:1px solid #e3e6ec;color:#1a1f2c;border-radius:6px;padding:4px 9px;">Approved</span>
      <span style="font-size:9px;font-weight:500;background:#fff;border:1px solid #e3e6ec;color:#1a1f2c;border-radius:6px;padding:4px 9px;">Paid</span>
      <span style="font-size:9px;font-weight:500;background:#fff;border:1px solid #e3e6ec;color:#1a1f2c;border-radius:6px;padding:4px 9px;">Rejected</span>
    </div>
    <div style="border:1px solid #e3e6ec;border-radius:8px;overflow:hidden;font-size:11px;">
      <div style="display:flex;background:rgba(227,230,236,.4);color:#5a6478;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:7px 10px;font-weight:600;">
        <div style="width:118px;">Status</div><div style="width:96px;">Entity</div><div style="flex:1;">Vendor</div><div style="width:70px;">Invoice #</div><div style="width:78px;text-align:right;">Amount</div><div style="width:54px;text-align:right;">Due</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e3e6ec;">
        <div style="width:118px;"><span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:600;">Awaiting Approval</span></div><div style="width:96px;"><span style="color:#2d6a4f;">●</span> <span style="color:#5a6478;font-size:10px;">Sanctuary</span></div><div style="flex:1;font-weight:600;">Gulf Coast Plumbing</div><div style="width:70px;font-family:monospace;color:#5a6478;font-size:10px;">INV-4471</div><div style="width:78px;text-align:right;font-weight:600;">$1,284.00</div><div style="width:54px;text-align:right;color:#5a6478;">Jun 12</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e3e6ec;">
        <div style="width:118px;"><span style="background:#dbeafe;color:#1e40af;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:600;">In Review · Dana M.</span></div><div style="width:96px;"><span style="color:#7a4f9c;">●</span> <span style="color:#5a6478;font-size:10px;">Crosby</span></div><div style="flex:1;font-weight:600;">Acme Office Supply</div><div style="width:70px;font-family:monospace;color:#5a6478;font-size:10px;">88213</div><div style="width:78px;text-align:right;font-weight:600;">$642.18</div><div style="width:54px;text-align:right;color:#5a6478;">Jun 09</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e3e6ec;">
        <div style="width:118px;"><span style="background:#d1fae5;color:#065f46;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:600;">Approved</span></div><div style="width:96px;"><span style="color:#3a6ea5;">●</span> <span style="color:#5a6478;font-size:10px;">Lakeside</span></div><div style="flex:1;font-weight:600;">Bayou Landscaping</div><div style="width:70px;font-family:monospace;color:#5a6478;font-size:10px;">BL-0922</div><div style="width:78px;text-align:right;font-weight:600;">$3,150.00</div><div style="width:54px;text-align:right;color:#5a6478;">Jun 15</div>
      </div>
      <div style="display:flex;align-items:center;padding:8px 10px;border-top:1px solid #e3e6ec;">
        <div style="width:118px;"><span style="background:#a7f3d0;color:#064e3b;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:600;">Paid</span></div><div style="width:96px;"><span style="color:#5e6b73;">●</span> <span style="color:#5a6478;font-size:10px;">Mandeville</span></div><div style="flex:1;font-weight:600;">City Utilities</div><div style="width:70px;font-family:monospace;color:#5a6478;font-size:10px;">553201</div><div style="width:78px;text-align:right;font-weight:600;">$812.44</div><div style="width:54px;text-align:right;color:#5a6478;">Jun 01</div>
      </div>
    </div>
  </div>
</div>
<div style="margin-top:14px;">
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Key Features</div>
  <ul style="margin:0 0 14px 18px;padding:0;font-size:12px;color:#444;line-height:1.65;">
    <li>PDF upload with AI extraction of vendor, amount, due date, and invoice number</li>
    <li>Claim-lock so two approvers never work the same bill at once</li>
    <li>Approve, reject, request changes, or mark paid — with required comments</li>
    <li>Real-time queue across five entities with search, filters, and CSV export</li>
  </ul>
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Tech Stack</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;">
    <span style="font-size:10px;background:#eaeef5;color:#2d4a7a;border:1px solid #e3e6ec;border-radius:20px;padding:3px 9px;">Next.js</span>
    <span style="font-size:10px;background:#eaeef5;color:#2d4a7a;border:1px solid #e3e6ec;border-radius:20px;padding:3px 9px;">TypeScript</span>
    <span style="font-size:10px;background:#eaeef5;color:#2d4a7a;border:1px solid #e3e6ec;border-radius:20px;padding:3px 9px;">Firebase</span>
    <span style="font-size:10px;background:#eaeef5;color:#2d4a7a;border:1px solid #e3e6ec;border-radius:20px;padding:3px 9px;">Claude</span>
    <span style="font-size:10px;background:#eaeef5;color:#2d4a7a;border:1px solid #e3e6ec;border-radius:20px;padding:3px 9px;">Resend</span>
    <span style="font-size:10px;background:#eaeef5;color:#2d4a7a;border:1px solid #e3e6ec;border-radius:20px;padding:3px 9px;">pdf-lib</span>
  </div>
  <p style="font-size:10px;color:#8b95a3;margin-top:12px;">Preview shown with sample data.</p>
</div>
`;

const OPS_SHOWCASE = `
<div style="pointer-events:none;cursor:default;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="background:#eef2f7;border:1px solid #e2e8f0;border-bottom:none;border-radius:10px 10px 0 0;padding:7px 12px;display:flex;align-items:center;gap:6px;">
    <span style="width:9px;height:9px;border-radius:50%;background:#e0726b;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#e6b450;display:inline-block;"></span>
    <span style="width:9px;height:9px;border-radius:50%;background:#5aa86a;display:inline-block;"></span>
    <span style="margin-left:8px;font-size:11px;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 10px;">command-center.app</span>
  </div>
  <div style="border:1px solid #e2e8f0;border-radius:0 0 10px 10px;background:#f6f8fb;padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:26px;height:26px;border-radius:7px;background:#1f4e79;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px;">◐</span>
        <div>
          <div style="font-size:15px;font-weight:700;color:#0f172a;">Operations Command Center</div>
          <div style="font-size:9px;color:#64748b;">Operations &amp; Financial Intelligence</div>
        </div>
      </div>
      <span style="font-size:9px;font-weight:600;background:#fffbeb;color:#b45309;border:1px solid #fde68a;border-radius:20px;padding:4px 9px;">Demo data</span>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <span style="font-size:10px;background:#fff;border:1px solid #e2e8f0;color:#334155;border-radius:7px;padding:5px 10px;">📍 All Locations</span>
      <span style="font-size:10px;background:#fff;border:1px solid #e2e8f0;color:#334155;border-radius:7px;padding:5px 10px;">🗓 This Month</span>
    </div>
    <div style="display:flex;gap:14px;border-bottom:1px solid #e2e8f0;margin-bottom:14px;">
      <span style="font-size:11px;font-weight:600;color:#1f4e79;border-bottom:2px solid #1f4e79;padding-bottom:7px;">Operations</span>
      <span style="font-size:11px;font-weight:500;color:#64748b;padding-bottom:7px;">Financials</span>
      <span style="font-size:11px;font-weight:500;color:#64748b;padding-bottom:7px;">Payers</span>
    </div>
    <div style="display:flex;gap:7px;margin-bottom:14px;">
      <div style="flex:1;background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:8px 9px;"><div style="font-size:17px;font-weight:700;color:#1d4ed8;">184</div><div style="font-size:8px;color:#64748b;">Inquiries</div></div>
      <div style="flex:1;background:#eef2ff;border:1px solid #e0e7ff;border-radius:8px;padding:8px 9px;"><div style="font-size:17px;font-weight:700;color:#4338ca;">96</div><div style="font-size:8px;color:#64748b;">Assessments</div></div>
      <div style="flex:1;background:#ecfdf5;border:1px solid #d1fae5;border-radius:8px;padding:8px 9px;"><div style="font-size:17px;font-weight:700;color:#047857;">41</div><div style="font-size:8px;color:#64748b;">Admissions</div></div>
      <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 9px;"><div style="font-size:17px;font-weight:700;color:#334155;">7</div><div style="font-size:8px;color:#64748b;">Transfers</div></div>
      <div style="flex:1;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 9px;"><div style="font-size:17px;font-weight:700;color:#b45309;">38</div><div style="font-size:8px;color:#64748b;">Discharges</div></div>
      <div style="flex:1;background:#fff1f2;border:1px solid #ffe4e6;border-radius:8px;padding:8px 9px;"><div style="font-size:17px;font-weight:700;color:#be123c;">112</div><div style="font-size:8px;color:#64748b;">Current Census</div></div>
    </div>
    <div style="display:flex;gap:10px;">
      <div style="flex:1;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:11px;">
        <div style="font-size:11px;font-weight:600;margin-bottom:2px;">Census by Level of Care</div>
        <div style="font-size:8px;color:#64748b;margin-bottom:10px;">Active patients today</div>
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><span style="width:62px;font-size:9px;color:#64748b;">Residential</span><span style="height:11px;width:78%;background:#1f4e79;border-radius:0 4px 4px 0;display:inline-block;"></span><span style="font-size:9px;color:#0f172a;">58</span></div>
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><span style="width:62px;font-size:9px;color:#64748b;">Detox</span><span style="height:11px;width:46%;background:#2c5f8d;border-radius:0 4px 4px 0;display:inline-block;"></span><span style="font-size:9px;color:#0f172a;">34</span></div>
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><span style="width:62px;font-size:9px;color:#64748b;">IOP</span><span style="height:11px;width:19%;background:#3a72a8;border-radius:0 4px 4px 0;display:inline-block;"></span><span style="font-size:9px;color:#0f172a;">14</span></div>
        <div style="display:flex;align-items:center;gap:7px;"><span style="width:62px;font-size:9px;color:#64748b;">OP</span><span style="height:11px;width:8%;background:#5e90bf;border-radius:0 4px 4px 0;display:inline-block;"></span><span style="font-size:9px;color:#0f172a;">6</span></div>
      </div>
      <div style="flex:1;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:11px;">
        <div style="font-size:11px;font-weight:600;margin-bottom:2px;">Admissions Trend</div>
        <div style="font-size:8px;color:#64748b;margin-bottom:10px;">Daily admissions in window</div>
        <svg viewBox="0 0 220 90" style="width:100%;height:88px;display:block;">
          <defs><linearGradient id="admg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2c5f8d" stop-opacity="0.55"/><stop offset="100%" stop-color="#2c5f8d" stop-opacity="0.05"/></linearGradient></defs>
          <polygon points="0,70 30,58 60,62 90,40 120,48 150,28 180,34 220,18 220,90 0,90" fill="url(#admg)"/>
          <polyline points="0,70 30,58 60,62 90,40 120,48 150,28 180,34 220,18" fill="none" stroke="#1f4e79" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</div>
<div style="margin-top:14px;">
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Key Features</div>
  <ul style="margin:0 0 14px 18px;padding:0;font-size:12px;color:#444;line-height:1.65;">
    <li>Operations view: inquiries, assessments, admissions, census by level of care</li>
    <li>Financials view: revenue, expenses, collections, AR, and a simple P&amp;L snapshot</li>
    <li>Payer performance: actual length of stay vs. authorized days, by payer</li>
    <li>Location and date-range filters across every metric and chart</li>
  </ul>
  <div style="font-size:12px;font-weight:700;color:#2d2d2d;margin-bottom:6px;">Tech Stack</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;">
    <span style="font-size:10px;background:#eaf1f8;color:#1f4e79;border:1px solid #e2e8f0;border-radius:20px;padding:3px 9px;">Next.js</span>
    <span style="font-size:10px;background:#eaf1f8;color:#1f4e79;border:1px solid #e2e8f0;border-radius:20px;padding:3px 9px;">TypeScript</span>
    <span style="font-size:10px;background:#eaf1f8;color:#1f4e79;border:1px solid #e2e8f0;border-radius:20px;padding:3px 9px;">Recharts</span>
    <span style="font-size:10px;background:#eaf1f8;color:#1f4e79;border:1px solid #e2e8f0;border-radius:20px;padding:3px 9px;">Tailwind</span>
    <span style="font-size:10px;background:#eaf1f8;color:#1f4e79;border:1px solid #e2e8f0;border-radius:20px;padding:3px 9px;">Firebase</span>
  </div>
  <p style="font-size:10px;color:#94a3b8;margin-top:12px;">Preview shown with anonymized sample data.</p>
</div>
`;

// Hand-curated showcase projects rendered ahead of any portfolio-enabled
// projects from Firestore. Copy is written to be accurate to each build with
// no invented metrics; the behavioral-health client is intentionally
// generalized rather than named.
const FEATURED_PROJECTS: DisplayProject[] = [
  {
    id: "featured-gscp",
    name: "GSCP Campaign Tracker",
    companyName: "Gulf South Commerce Park",
    status: "active",
    portfolioDescription:
      "A live lead-tracking dashboard for a demand-validation campaign — every prospect, contact detail, and pipeline stage in one searchable place. A scheduled AI routine researches new leads, fills in missing contact info, and drafts outreach emails for human review, while every inline edit is saved with a full per-field audit trail.",
    portfolioBenefits:
      "Replaced scattered spreadsheets with a single source of truth and automated the repetitive research and follow-up work — so the team spends its time on conversations, not data entry.",
    portfolioContent: GSCP_SHOWCASE,
  },
  {
    id: "featured-sanctuary-household",
    name: "Household Analysis Manager",
    companyName: "Sanctuary HOA",
    status: "active",
    portfolioDescription:
      "A data-reconciliation tool that brings an HOA's residents, properties, vehicles, and entry tags into one place. It automatically surfaces duplicate and overlapping household records, supports merging and re-linking, and logs every change to a real-time, multi-user changelog.",
    portfolioBenefits:
      "Turned a tangle of duplicated, migrated records into clean, trustworthy household data — with an audit trail that makes every correction accountable.",
    portfolioContent: HOUSEHOLD_SHOWCASE,
  },
  {
    id: "featured-billing-approval",
    name: "Billing Approval Center",
    companyName: "Crosby Management",
    status: "active",
    portfolioDescription:
      "A digital replacement for a paper-based vendor-bill approval process spanning five business entities. Bills are uploaded as PDFs, key fields are extracted automatically by AI, and each bill moves through a real-time approval queue — with a claim-lock that prevents two approvers from working the same bill at once.",
    portfolioBenefits:
      "Collapsed a slow paper-routing process into a transparent digital queue, eliminating duplicate approvals and giving every bill a clean, compliant audit trail.",
    portfolioContent: BILLING_SHOWCASE,
  },
  {
    id: "featured-viger-command",
    name: "Operations Command Center",
    companyName: "Multi-Location Behavioral Health Provider",
    status: "on_hold",
    portfolioDescription:
      "An executive command center that consolidates operations and financial data from multiple disconnected systems — EHR, accounting, and call tracking — into a single real-time view. Leadership can see admissions, census, payer performance, and revenue across every location without clicking between platforms.",
    portfolioBenefits:
      "Replaces hours of manual, multi-system report assembly with one consolidated dashboard, giving leadership the fast, location-level visibility they need to make operational decisions.",
    portfolioContent: OPS_SHOWCASE,
  },
];

export default function PortfolioPage() {
  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null);

  useEffect(() => {
    getPortfolioProjects()
      .then((p) => setProjects(p))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Featured showcases first, then anything enabled from the CRM.
  const allProjects: DisplayProject[] = [...FEATURED_PROJECTS, ...projects];

  return (
    <ScrollRevealProvider>
      {/* Hero */}
      <section className="relative bg-charcoal text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 hero-fade-in">
            Our Work
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto hero-fade-in hero-delay-1">
            Real solutions we&apos;ve built for real businesses. Each project started with a problem and ended with a working tool.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {allProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="text-left bg-white border border-border rounded-xl p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-charcoal group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ml-3 ${
                      project.status === "active"
                        ? "bg-green-600/10 text-green-700"
                        : project.status === "completed"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-700"
                    }`}>
                      {project.status === "active" ? "Active" : project.status === "completed" ? "Delivered" : "In Progress"}
                    </span>
                  </div>

                  <p className="text-sm text-muted mb-4">{project.companyName}</p>

                  <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-3">
                    {project.portfolioDescription || "Custom software solution built to streamline operations and eliminate manual bottlenecks."}
                  </p>

                  {project.portfolioBenefits && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-accent uppercase tracking-wide mb-1">Impact</p>
                      <p className="text-sm text-charcoal/60 line-clamp-2">{project.portfolioBenefits}</p>
                    </div>
                  )}

                  <p className="text-xs text-accent font-medium mt-4 group-hover:underline">View details &rarr;</p>
                </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-in">
            Have a similar problem?
          </h2>
          <p className="text-white/60 mb-8 animate-in animate-delay-1">
            Every project starts with a conversation about what&apos;s slowing your business down.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors animate-in animate-delay-2"
          >
            Tell Us Your Headache
          </Link>
        </div>
      </section>

      {/* Detail modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-neutral hover:bg-border transition-colors text-charcoal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-charcoal">{selectedProject.name}</h2>
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ml-3 ${
                  selectedProject.status === "active"
                    ? "bg-green-600/10 text-green-700"
                    : selectedProject.status === "completed"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-amber-500/10 text-amber-700"
                }`}>
                  {selectedProject.status === "active" ? "Active" : selectedProject.status === "completed" ? "Delivered" : "In Progress"}
                </span>
              </div>
              <p className="text-muted mb-6">{selectedProject.companyName}</p>

              <div className="mb-6">
                <p className="text-charcoal/80 leading-relaxed">
                  {selectedProject.portfolioDescription || "Custom software solution built to streamline operations and eliminate manual bottlenecks."}
                </p>
              </div>

              {selectedProject.portfolioContent && (
                <div className="mb-6 border border-border rounded-xl p-4 overflow-hidden" dangerouslySetInnerHTML={{ __html: selectedProject.portfolioContent }} />
              )}

              {selectedProject.portfolioBenefits && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Client Impact</p>
                  <p className="text-charcoal/80 leading-relaxed">{selectedProject.portfolioBenefits}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border text-center">
                <Link
                  href="/contact"
                  className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Start a Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScrollRevealProvider>
  );
}
