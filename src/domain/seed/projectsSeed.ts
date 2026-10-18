import type { Project } from '../types';
import { getIsoDateOffset } from '../../lib/dates';

const HARBOR_START_OFFSET = -30;
const HARBOR_TARGET_OFFSET = 21;
const HARBOR_PROGRESS = 57;
const HARBOR_BUDGET_ALLOCATED = 185000;
const HARBOR_BUDGET_SPENT = 105000;

const FERNLIGHT_START_OFFSET = -15;
const FERNLIGHT_TARGET_OFFSET = 35;
const FERNLIGHT_PROGRESS = 40;
const FERNLIGHT_BUDGET_ALLOCATED = 140000;
const FERNLIGHT_BUDGET_SPENT = 56000;

const ORCHARD_START_OFFSET = -25;
const ORCHARD_TARGET_OFFSET = 12;
const ORCHARD_PROGRESS = 40;
const ORCHARD_BUDGET_ALLOCATED = 210000;
const ORCHARD_BUDGET_SPENT = 84000;

const ATLAS_START_OFFSET = -22;
const ATLAS_TARGET_OFFSET = 9;
const ATLAS_PROGRESS = 75;
const ATLAS_BUDGET_ALLOCATED = 160000;
const ATLAS_BUDGET_SPENT = 120000;

const LUMEN_START_OFFSET = -35;
const LUMEN_TARGET_OFFSET = -7;
const LUMEN_PROGRESS = 100;
const LUMEN_BUDGET_ALLOCATED = 95000;
const LUMEN_BUDGET_SPENT = 95000;

const NORTHWIND_START_OFFSET = 8;
const NORTHWIND_TARGET_OFFSET = 60;
const NORTHWIND_PROGRESS = 0;
const NORTHWIND_BUDGET_ALLOCATED = 110000;
const NORTHWIND_BUDGET_SPENT = 0;

export function createSeedProjects(): Project[] {
  return [
    {
      id: 'prj-harbor',
      code: 'PLT-101',
      name: 'Harbor Mobile Banking Redesign',
      client: 'Harbor & Vale Credit Union',
      sector: 'Financial Technology',
      status: 'On Track',
      leadId: 'usr-mireia',
      startDate: getIsoDateOffset(HARBOR_START_OFFSET),
      targetDate: getIsoDateOffset(HARBOR_TARGET_OFFSET),
      progress: HARBOR_PROGRESS,
      budgetAllocated: HARBOR_BUDGET_ALLOCATED,
      budgetSpent: HARBOR_BUDGET_SPENT,
      summary: 'Mobile banking application redesign and design system consolidation.',
    },
    {
      id: 'prj-fernlight',
      code: 'PLT-102',
      name: 'Fernlight Wellness App',
      client: 'Fernlight Health',
      sector: 'Healthcare & Wellness',
      status: 'At Risk',
      leadId: 'usr-nadia',
      startDate: getIsoDateOffset(FERNLIGHT_START_OFFSET),
      targetDate: getIsoDateOffset(FERNLIGHT_TARGET_OFFSET),
      progress: FERNLIGHT_PROGRESS,
      budgetAllocated: FERNLIGHT_BUDGET_ALLOCATED,
      budgetSpent: FERNLIGHT_BUDGET_SPENT,
      summary: 'Personal habit tracking, wellness diagnostic flows, and companion app.',
    },
    {
      id: 'prj-orchard',
      code: 'PLT-103',
      name: 'Orchard Logistics Dashboard',
      client: 'Orchard Freight',
      sector: 'Supply Chain & Freight',
      status: 'On Track',
      leadId: 'usr-soren',
      startDate: getIsoDateOffset(ORCHARD_START_OFFSET),
      targetDate: getIsoDateOffset(ORCHARD_TARGET_OFFSET),
      progress: ORCHARD_PROGRESS,
      budgetAllocated: ORCHARD_BUDGET_ALLOCATED,
      budgetSpent: ORCHARD_BUDGET_SPENT,
      summary: 'Real-time fleet shipment tracking, telemetry map, and route optimization.',
    },
    {
      id: 'prj-atlas',
      code: 'PLT-104',
      name: 'Atlas Travel Booking Flow',
      client: 'Atlas Journeys',
      sector: 'Travel & Transportation',
      status: 'On Track',
      leadId: 'usr-soren',
      startDate: getIsoDateOffset(ATLAS_START_OFFSET),
      targetDate: getIsoDateOffset(ATLAS_TARGET_OFFSET),
      progress: ATLAS_PROGRESS,
      budgetAllocated: ATLAS_BUDGET_ALLOCATED,
      budgetSpent: ATLAS_BUDGET_SPENT,
      summary: 'Streamlined itinerary booking, seat reservation grid, and checkout.',
    },
    {
      id: 'prj-lumen',
      code: 'PLT-105',
      name: 'Lumen Museum Website',
      client: 'Lumen Museum of Design',
      sector: 'Arts & Culture',
      status: 'Completed',
      leadId: 'usr-kaelen',
      startDate: getIsoDateOffset(LUMEN_START_OFFSET),
      targetDate: getIsoDateOffset(LUMEN_TARGET_OFFSET),
      progress: LUMEN_PROGRESS,
      budgetAllocated: LUMEN_BUDGET_ALLOCATED,
      budgetSpent: LUMEN_BUDGET_SPENT,
      summary: 'Accessible digital gallery, exhibition archive, and ticketing platform.',
    },
    {
      id: 'prj-northwind',
      code: 'PLT-106',
      name: 'Northwind Brand Refresh',
      client: 'Northwind Coffee Roasters',
      sector: 'Consumer Goods & Retail',
      status: 'Planning',
      leadId: 'usr-mireia',
      startDate: getIsoDateOffset(NORTHWIND_START_OFFSET),
      targetDate: getIsoDateOffset(NORTHWIND_TARGET_OFFSET),
      progress: NORTHWIND_PROGRESS,
      budgetAllocated: NORTHWIND_BUDGET_ALLOCATED,
      budgetSpent: NORTHWIND_BUDGET_SPENT,
      summary: 'Brand identity positioning, packaging system, and digital presence.',
    },
  ];
}
