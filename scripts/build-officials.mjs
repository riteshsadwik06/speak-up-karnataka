/**
 * Build-time transform of the Bengawalk "city officials" dataset into the
 * compact asset the app ships (src/assets/blr-officials.json).
 *
 * Source: https://github.com/Vonter/city-officials (non-code data: CC BY 4.0)
 * Run:    node scripts/build-officials.mjs [outfile]
 *
 * Never fetched at runtime — the derived asset is committed/uploaded.
 */
import { writeFileSync } from "node:fs";

const SRC = "https://raw.githubusercontent.com/Vonter/city-officials/main/static/blr/officials.json";
const OUT = process.argv[2] ?? "src/assets/blr-officials.json";

const DEPARTMENT_BLOCKS = {
  gba_zone: "gbaZone",
  gba_corporation: "gbaCorporation",
  bbmp_zone: "bbmpZone",
  bwssb_subdivision: "bwssbSubdivision",
  bescom_subdivision: "bescomSubdivision",
  police_city: "policeCity",
  election_ac: "electionAc",
  bbmp_wards_old: "oldCorporator",
  bwssb_service_station: "bwssbServiceStation",
  bescom_section: "bescomSection",
};

const clean = (v) => (typeof v === "string" ? v.trim() : "");

function official(r) {
  const o = {};
  const fields = {
    designation: clean(r["Designation"]),
    name: clean(r["Name"]),
    phone: clean(r["Phone"]),
    email: clean(r["E-Mail"]),
    nameKn: clean(r["NameRegional"]),
    designationKn: clean(r["DesignationRegional"]),
  };
  for (const [k, v] of Object.entries(fields)) if (v) o[k] = v;
  return o;
}

const res = await fetch(SRC);
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const records = await res.json();

const out = {
  _source: "https://github.com/Vonter/city-officials",
  _licence: "Non-code data: CC BY 4.0",
  wards: {},
};
for (const key of Object.values(DEPARTMENT_BLOCKS)) out[key] = {};

for (const r of records) {
  const dept = clean(r["Department"]);
  const area = clean(r["Area"]);
  if (!area) continue;

  if (dept === "gba_ward") {
    const m = area.match(/^\s*(\d+)\s*:\s*(.+?)\s*$/);
    const wardNo = m ? m[1] : "";
    const rawName = (m ? m[2] : area).trim();
    if (!rawName) continue;
    const block = (out.wards[rawName] ??= { wardNo, officials: [] });
    if (!block.wardNo && wardNo) block.wardNo = wardNo;
    const old = clean(r["Notes"]).match(/Mapped from old BBMP ward:\s*(.+)$/i);
    if (old && !block.oldBbmpWard) block.oldBbmpWard = old[1].trim();
    const o = official(r);
    if (Object.keys(o).length) block.officials.push(o);
    continue;
  }

  const target = DEPARTMENT_BLOCKS[dept];
  if (!target) continue;
  const o = official(r);
  if (!Object.keys(o).length) continue;
  (out[target][area] ??= []).push(o);
}

// stable key order for a clean diff
const sortKeys = (obj) =>
  Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
out.wards = sortKeys(out.wards);
for (const key of Object.values(DEPARTMENT_BLOCKS)) out[key] = sortKeys(out[key]);

writeFileSync(OUT, JSON.stringify(out));
const wardCount = Object.keys(out.wards).length;
const withOld = Object.values(out.wards).filter((w) => w.oldBbmpWard).length;
const officials = Object.values(out.wards).reduce((n, w) => n + w.officials.length, 0);
console.log(
  `${OUT}: ${wardCount} wards, ${withOld} with oldBbmpWard, ${officials} ward officials (${(officials / wardCount).toFixed(1)}/ward)`,
);
