// Every number in Scrap2Cash NG traces back to one of these sources.
// Accessed 2026-10-25. Prices are buyer quotes or press reports, NOT guarantees.

export interface Source {
  id: string
  title: string
  url: string
  date: string // publication or "as listed" date
  note: string
}

export const SOURCES: Source[] = [
  {
    id: 'fifthseed',
    title: 'Fifthseed Recycling Ltd (Port Harcourt): Price List 24/10/26',
    url: 'https://docs.google.com/spreadsheets/d/1XYgW8a5D7RBHWZyWwPtipIFo2YH5X-EejqsLbWBkC68/edit?usp=sharing',
    date: '2026-10-24',
    note: 'Linked from fifthseedrecycling.com/services. 1–300 kg column used: clear PET ₦300 (oil-stained ₦120), green ₦80, brown ₦70, hard plastic ₦280, sachet ₦40, carton ₦80, white paper ₦60, beverage cans ₦1,800, soft aluminium ₦2,300, thick ₦1,700, cast ₦1,550, light iron ₦430, thick iron ₦480.',
  },
  {
    id: 'westman',
    title: 'Westman Recycle NG: "Today\'s buy rates" (Lekki, Lagos)',
    url: 'https://westmanrecycle.com/',
    date: 'listed Oct 2026',
    note: 'PET ₦200/kg, aluminium cans ₦500/kg, cartons ₦70/kg, paper ₦60/kg, nylon ₦60/kg, hard plastics ₦120/kg, iron/tin ₦300/kg. Deducts 3 kg for the jumbo bag.',
  },
  {
    id: 'nairametrics-2026',
    title: 'Nairametrics: "Scavengers earn N400,000 monthly as recycling business grows in Nigeria"',
    url: 'https://nairametrics.com/2026/04/07/scavengers-earn-n400000-monthly-as-recycling-business-grows-in-nigeria/',
    date: '2026-04-07',
    note: 'Colourless PET ₦250/kg, coloured PET ₦200/kg (Ojo, Lagos); cartons ₦250–₦300/kg when sold on by collectors, ₦100/kg buying price from shops.',
  },
  {
    id: 'nairametrics-2025',
    title: 'Nairametrics: "From trash to millions: How plastic waste collectors in Nigeria are cashing in"',
    url: 'https://nairametrics.com/2025/07/11/from-trash-to-millions-how-plastic-waste-collectors-in-nigeria-are-cashing-in/',
    date: '2025-07-11',
    note: 'Scavengers sell PET from ~₦250/kg; middlemen ₦400+; bulk suppliers to recycling plants ₦500–₦600/kg.',
  },
  {
    id: 'ecobarter',
    title: 'SabiAbuja: "Explore Ecobarter: ATM for Plastics in Abuja"',
    url: 'https://sabiabuja.com/atm-for-plastics-in-abuja/',
    date: '2025-10-13',
    note: 'Plastic bottles ~₦120/kg, cans ~₦360/kg, metals ~₦200/kg; ~50 bottles or cans per kg. Lists 9 Abuja machine locations.',
  },
  {
    id: 'vmartins',
    title: 'V-Martins Metal Recycling: "Scrap Metal Prices in Nigeria, 2026" (Lagos)',
    url: 'https://www.vmartinsrecyclingcompany.com/scrap-metal-prices',
    date: 'Oct 2026',
    note: 'Iron/steel ₦400–₦500/kg; bare copper ₦12,000–₦14,000/kg; insulated copper wire ₦2,500–₦3,000/kg; brass ₦7,500–₦8,000/kg; aluminium profile ₦2,000–₦2,500/kg; cast aluminium ₦1,800–₦2,200/kg.',
  },
  {
    id: 'technext',
    title: 'Technext: "Iron Condemn: Nigeria\'s ₦200 billion scrap metal industry explained"',
    url: 'https://technext24.com/reviews/how-nigerias-scrap-metal-industry-works/',
    date: '2026-07-30',
    note: 'Merchants buy iron ₦700–₦800/kg, aluminium ~₦2,000/kg, brass ~₦8,000/kg, pure copper ₦14,500–₦15,500/kg.',
  },
  {
    id: 'jhonks',
    title: 'Jhonks recycling app: "Available Materials"',
    url: 'https://jhonks.com/',
    date: 'listed Oct 2026',
    note: 'Plastic ₦200/kg, metal ₦500/kg, carton ₦200/kg, aluminium ₦1,000/kg, copper wire ₦8,000/kg, brass ₦2,000/kg.',
  },
  {
    id: 'epa-warm',
    title: 'US EPA WARM v16: Management Practices Chapters, Exhibit 1-1 (MTCO2E per short ton)',
    url: 'https://www.epa.gov/system/files/documents/2024-01/warm_management_practices_v16_dec.pdf',
    date: 'Dec 2023',
    note: 'Net recycling vs landfilling emission factors. CO₂e saved per kg = (landfill factor − recycling factor) × 1.102311.',
  },
  {
    id: 'epron',
    title: 'EPRON (E-waste Producer Responsibility Organisation Nigeria): Collection Centres',
    url: 'https://epron.org.ng/collection-centres/',
    date: 'accessed 2026-10-25',
    note: 'Official e-waste collection centres by state, incl. Rivers, Abuja (FCT) and Lagos.',
  },
]

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id)
