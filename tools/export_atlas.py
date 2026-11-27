#!/usr/bin/env python3
"""One-off export of the catalog for the atlas page.

Reads data/Systema_Intelligentiae_Catalog.xlsx and writes two hand-reviewable tables:
  site/content/atlas_systems.csv   name, years_before_today, ops_per_sec, kind, rate_basis
  site/content/atlas_coverage.csv  dimension, kind, systems_measured  (+ rows with dimension "_total")

`kind` is a first keyword pass over each system's name, domain and taxon. It is a placeholder for a reviewed
column in the catalog: edit atlas_systems.csv by hand (or replace this script) and rebuild. Rows whose origin
date contradicts their kind are left out and listed on stderr. Catalog ids are not exported (design rule 6).
"""
import collections, csv, pathlib, re, sys
import openpyxl

SITE = pathlib.Path(__file__).resolve().parent.parent
XLSX = SITE.parent / "data" / "Systema_Intelligentiae_Catalog.xlsx"
KINDS = ["chem", "nerve", "ai", "sil", "exo", "grp"]
AI = r'transformer|foundation model|\bllm\b|gpt|neural network|deep rl|alphazero|alphago|alphafold|perceptron|reasoning model|agentic|autonomous .*(agent|ai)|diffusion model|deepseek|language model|connectionist|deep learning|convolutional|self-play|mixture of experts|frontier ai|deliberative ai'
SIL = r'synthetic|processor|computer|eniac|quantum|neuromorphic|\btpu\b|wafer|data ?cent|internet|arpanet|world wide web|calculat|analytical engine|antikythera|abacus|jacquard|telegraph|transistor|\bchip\b|cmos|mainframe|smartphone|server|silicon|integrated circuit|punch'
EXO = r'cuneiform|papyrus|library|archive|printing|movable type|codex|quipu|khipu|clay token|encyclop|bible|tablet|inscri|engrav|parietal|manuscript|scroll|lexical|seal\b|ochre|cave art|notation'
GRP = r'collective|colony|superorganism|swarm|society|empire|\bstate\b|pride|huddle|biofilm|microbial mat|flock|shoal|herd|troop|civiliz|eusocial|polity|chiefdom|city|kingdom|league|guild|caravan|network of'
CHEM = r'\bcell\b|bacteri|archae|plant|\bpine\b|spruce|fung|slime mold|alga|volvox|trichoplax|sponge|protocell|virus|\btree\b|moss|yeast|amoeba|mimosa|primrose|flytrap|mycel|lichen|diatom|ciliate|paramecium|physarum|dictyostelium|chloroplast|mitochond|ribosome|\bluca\b|cyanobact|stromatolite|kelp|fern|orchid|vine|root|seedling|phage|plasmid|prion|euglena|stentor|choanoflagellate'


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def kind_of(name, domain, taxon):
    s = " ".join(str(x or "") for x in (name, domain, taxon)).lower()
    for k, rx in (("ai", AI), ("sil", SIL), ("exo", EXO), ("grp", GRP), ("chem", CHEM)):
        if re.search(rx, s):
            return k
    return "nerve"


def main():
    wb = openpyxl.load_workbook(XLSX, read_only=True)
    rows = list(wb["Evolutionary_Time_Origins"].iter_rows(values_only=True))
    kind, out, seen, dropped = {}, [], set(), []
    for r in rows[1:]:
        if not r or not r[0] or r[0] in seen:
            continue
        seen.add(r[0])
        k = kind[r[0]] = kind_of(r[1], r[2], r[3])
        ops, ma = num(r[8]), num(r[5])
        if not ops or ops <= 0 or ma is None:
            continue
        yrs = max(num(r[4]) if num(r[4]) is not None else ma * 1e6, 1.0)
        if (k in ("ai", "sil") and yrs > 5000) or (k in ("nerve", "chem") and yrs < 200) or yrs > 4.2e9:
            dropped.append(str(r[1]))
            continue
        # a rate that is an exact power of ten is a class estimate, not a measurement
        basis = "class" if abs(round(__import__("math").log10(ops)) - __import__("math").log10(ops)) < 1e-9 else "estimate"
        out.append({"name": str(r[1]).strip()[:64], "years_before_today": f"{yrs:.6g}", "ops_per_sec": f"{ops:.6g}", "kind": k, "rate_basis": basis})
    with open(SITE / "content" / "atlas_systems.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["name", "years_before_today", "ops_per_sec", "kind", "rate_basis"])
        w.writeheader(); w.writerows(out)

    mrows = list(wb["Metrics"].iter_rows(values_only=True))
    hi = next(i for i, r in enumerate(mrows) if r and str(r[0]).strip() == "Metric ID")
    di = next(i for i, c in enumerate(mrows[hi]) if c and "imension" in str(c))
    dim = {r[0]: str(r[di]) for r in mrows[hi + 1:] if r and r[0]}
    cov = collections.defaultdict(lambda: collections.defaultdict(set))
    for r in list(wb["Measurements"].iter_rows(values_only=True))[7:]:
        if r and r[0] and r[1] and r[3] and dim.get(r[3]) and kind.get(r[1]):
            cov[dim[r[3]]][kind[r[1]]].add(r[1])
    dims = sorted(cov, key=lambda d: -sum(len(v) for v in cov[d].values()))
    totals = collections.Counter(kind.values())
    with open(SITE / "content" / "atlas_coverage.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["dimension", "kind", "systems_measured"])
        for k in KINDS:
            w.writerow(["_total", k, totals[k]])
        for d in dims:
            for k in KINDS:
                w.writerow([d, k, len(cov[d][k])])
    print(f"{len(out)} systems, {len(dims)} dimensions; left out {len(dropped)} rows with contradictory dates", file=sys.stderr)


if __name__ == "__main__":
    main()
