import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The medical oncology keyterm core.
 *
 * WHY THESE WORDS. Nova-3 Medical already knows common medical English. What it reliably gets
 * wrong on an Indian oncology round is exactly this list: regimen acronyms spoken as words
 * ("FOLFOX", "R-CHOP", "ABVD"), cytotoxic drug names that sound like nothing else in English
 * ("pemetrexed", "bortezomib", "daratumumab"), the count vocabulary a whole ward runs on
 * ("ANC", "nadir", "filgrastim"), the toxicity and response shorthand ("mucositis", "grade 3",
 * "partial response"), and the access devices ("chemoport", "PICC line").
 *
 * Where the surgical core is procedure- and anatomy-heavy, this one is DRUG-, COUNT- and
 * TOXICITY-heavy. That difference is the whole point of a specialty lexicon.
 *
 * Everything here is tagged `medical-oncology`, so it is only ever boosted for a unit whose
 * pack asks for it. A surgical unit's keyterm budget is never spent on bortezomib.
 *
 * ONE TERM IS DELIBERATELY ABSENT: "RT". It is ambiguous between radiotherapy and Ryle's tube
 * and the app already refuses to expand it — see CONTEXT.md §2. Do not add it.
 */

const CHEMO = "chemotherapy" as const;
const ONC = "oncology" as const;

function regimen(term: string, aliases: string[], diagnoses: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: [CHEMO],
    specialties: ["medical-oncology"],
    diagnoses,
    triggers: [term.toLowerCase(), ...aliases.map((a) => a.toLowerCase())],
    priority: PRIORITY.EXACT_PATIENT,
  };
}

function drug(term: string, aliases: string[] = [], triggers: string[] = []): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: [CHEMO, "medication"],
    specialties: ["medical-oncology"],
    triggers: [term.toLowerCase(), ...aliases.map((a) => a.toLowerCase()), ...triggers],
    priority: PRIORITY.RELATED,
  };
}

function onc(
  term: string,
  aliases: string[] = [],
  triggers: string[] = [],
  priority: number = PRIORITY.SPECIALTY
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: [ONC],
    specialties: ["medical-oncology"],
    triggers: [term.toLowerCase(), ...aliases.map((a) => a.toLowerCase()), ...triggers],
    priority,
  };
}

export const ONCOLOGY: MedicalLexiconEntry[] = [
  // --- Regimens, spoken as one word ------------------------------------------------------
  regimen("FOLFOX", ["folfox", "mFOLFOX6", "folfox six"], ["carcinoma colon", "colorectal", "gastric"]),
  regimen("FOLFIRI", ["folfiri"], ["colorectal", "carcinoma colon", "carcinoma rectum"]),
  regimen("CAPOX", ["capox", "XELOX", "xelox"], ["colorectal", "gastric"]),
  regimen("R-CHOP", ["RCHOP", "R CHOP", "CHOP", "chop"], ["lymphoma", "DLBCL", "non-hodgkin"]),
  regimen("ABVD", ["abvd"], ["hodgkin", "lymphoma"]),
  regimen("BEACOPP", ["beacopp"], ["hodgkin", "lymphoma"]),
  regimen("VRd", ["VRD", "bortezomib lenalidomide dexamethasone", "velcade revlimid dex"], ["myeloma"]),
  regimen("DaraVRd", ["dara VRd", "daratumumab VRd"], ["myeloma"]),
  regimen("BEP", ["bleomycin etoposide cisplatin"], ["germ cell", "testicular"]),
  regimen("AC-T", ["AC T", "adriamycin cyclophosphamide taxol", "AC followed by taxol"], ["carcinoma breast", "breast"]),
  regimen("TCH", ["docetaxel carboplatin trastuzumab"], ["carcinoma breast", "her2"]),
  regimen("carboplatin-paclitaxel", ["carbo taxol", "carboplatin paclitaxel"], ["ovarian", "lung", "carcinoma ovary"]),
  regimen("7+3 induction", ["seven plus three", "3+7", "daunorubicin cytarabine"], ["AML", "acute myeloid leukaemia"]),
  regimen("BFM protocol", ["BFM", "berlin frankfurt munster"], ["ALL", "acute lymphoblastic leukaemia"]),
  regimen("hyper-CVAD", ["hyperCVAD", "hyper CVAD"], ["ALL", "lymphoma"]),

  // --- Cytotoxics ------------------------------------------------------------------------
  drug("cisplatin", ["cis platin"]),
  drug("carboplatin"),
  drug("oxaliplatin"),
  drug("paclitaxel", ["taxol"]),
  drug("docetaxel", ["taxotere"]),
  drug("gemcitabine", ["gemzar"]),
  drug("pemetrexed", ["alimta"]),
  drug("doxorubicin", ["adriamycin", "adria"]),
  drug("epirubicin"),
  drug("daunorubicin"),
  drug("cyclophosphamide", ["endoxan"]),
  drug("ifosfamide", ["ifos"]),
  drug("etoposide", ["VP-16", "vp sixteen"]),
  drug("cytarabine", ["ara-C", "ara C", "high dose ara-C", "HiDAC"]),
  drug("methotrexate", ["MTX", "high dose methotrexate", "intrathecal methotrexate"]),
  drug("5-fluorouracil", ["5-FU", "five FU", "fluorouracil"]),
  drug("capecitabine", ["xeloda"]),
  drug("irinotecan"),
  drug("vincristine", ["oncovin"]),
  drug("vinblastine"),
  drug("vinorelbine"),
  drug("bleomycin"),
  drug("dacarbazine", ["DTIC"]),
  drug("mercaptopurine", ["6-MP", "six MP"]),
  drug("asparaginase", ["L-asparaginase", "pegaspargase"]),
  drug("bendamustine"),
  drug("melphalan"),
  drug("temozolomide"),

  // --- Targeted, immunotherapy, hormonal --------------------------------------------------
  drug("rituximab", ["mabthera", "reditux", "anti-CD20"]),
  drug("trastuzumab", ["herceptin", "anti-HER2"]),
  drug("bevacizumab", ["avastin"]),
  drug("cetuximab", ["erbitux"]),
  drug("pembrolizumab", ["keytruda"]),
  drug("nivolumab", ["opdivo"]),
  drug("bortezomib", ["velcade"]),
  drug("lenalidomide", ["revlimid"]),
  drug("daratumumab", ["darzalex", "anti-CD38"]),
  drug("imatinib", ["gleevec", "glivec", "veenat"]),
  drug("osimertinib", ["tagrisso"]),
  drug("gefitinib", ["iressa"]),
  drug("erlotinib"),
  drug("sorafenib"),
  drug("sunitinib"),
  drug("tamoxifen"),
  drug("letrozole"),
  drug("anastrozole"),
  drug("abiraterone"),
  drug("enzalutamide"),
  drug("bicalutamide"),
  drug("goserelin", ["zoladex"]),
  drug("all-trans retinoic acid", ["ATRA", "tretinoin"], ["APL", "promyelocytic"]),
  drug("arsenic trioxide", ["ATO"], ["APL", "promyelocytic"]),

  // --- Supportive drugs the ward says every day -------------------------------------------
  drug("filgrastim", ["G-CSF", "GCSF", "grafeel", "neupogen", "growth factor"], ["neutropenia", "nadir"]),
  drug("pegfilgrastim", ["peg G-CSF", "pegylated GCSF"], ["neutropenia"]),
  drug("ondansetron", ["emeset", "zofran"], ["vomiting", "emesis"]),
  drug("palonosetron", ["aloxi"], ["vomiting", "emesis"]),
  drug("aprepitant", ["emend", "fosaprepitant"], ["vomiting", "emesis"]),
  drug("mesna", [], ["ifosfamide", "cyclophosphamide", "haemorrhagic cystitis"]),
  drug("leucovorin", ["folinic acid", "calcium leucovorin", "rescue"], ["methotrexate", "folfox", "folfiri"]),
  drug("rasburicase", [], ["tumour lysis", "TLS", "uric acid"]),
  drug("allopurinol", ["zyloric"], ["tumour lysis", "TLS", "uric acid"]),
  drug("zoledronic acid", ["zoledronate", "zometa"], ["myeloma", "bone metastasis", "hypercalcaemia"]),
  drug("denosumab", ["xgeva"], ["bone metastasis", "myeloma"]),
  drug("piperacillin-tazobactam", ["piptaz", "pip-taz", "zosyn", "tazact"], ["febrile neutropenia", "fever", "neutropenia"]),
  drug("meropenem", ["meronem"], ["febrile neutropenia", "sepsis"]),
  drug("cefepime", [], ["febrile neutropenia"]),
  drug("caspofungin", [], ["fungal", "febrile neutropenia"]),
  drug("voriconazole", [], ["fungal", "aspergillosis"]),
  drug("co-trimoxazole", ["septran", "bactrim", "TMP-SMX"], ["prophylaxis", "pneumocystis", "PCP"]),
  drug("acyclovir", ["aciclovir"], ["zoster", "prophylaxis", "bortezomib"]),

  // --- Counts and haematology --------------------------------------------------------------
  onc("absolute neutrophil count", ["ANC", "A N C", "neutrophil count"], ["neutropenia", "counts", "nadir"], PRIORITY.EXACT_PATIENT),
  onc("nadir", ["count nadir", "nadir counts"], ["chemotherapy", "cycle"], PRIORITY.EXACT_PATIENT),
  onc("febrile neutropenia", ["FN", "neutropenic fever", "neutropenic sepsis"], ["fever", "neutropenia"], PRIORITY.EXACT_PATIENT),
  onc("pancytopenia", [], ["counts", "marrow"]),
  onc("thrombocytopenia", ["low platelets", "platelet count"], ["bleeding", "platelets"]),
  onc("blast", ["blasts", "blast percentage", "peripheral blasts"], ["leukaemia", "marrow"]),
  onc("bone marrow aspiration", ["BMA", "marrow aspirate", "bone marrow biopsy", "trephine biopsy"], ["leukaemia", "lymphoma", "myeloma", "pancytopenia"], PRIORITY.RELATED),
  onc("flow cytometry", ["immunophenotyping", "MRD by flow"], ["leukaemia", "lymphoma"]),
  onc("minimal residual disease", ["MRD"], ["leukaemia"]),
  onc("cytogenetics", ["karyotype", "FISH"], ["leukaemia", "myeloma"]),
  onc("Philadelphia chromosome", ["BCR-ABL", "ph positive"], ["CML", "ALL", "leukaemia"]),
  onc("packed red cells", ["PRBC", "packed cells", "one unit PRBC"], ["transfusion", "anaemia"]),
  onc("single donor platelets", ["SDP", "random donor platelets", "RDP", "platelet transfusion"], ["transfusion", "thrombocytopenia"]),
  onc("irradiated leucodepleted", ["irradiated products", "leucodepleted"], ["transfusion"]),
  onc("serum free light chain", ["free light chain ratio", "kappa lambda ratio", "FLC"], ["myeloma"]),
  onc("M-protein", ["M band", "monoclonal protein", "serum protein electrophoresis", "SPEP"], ["myeloma"]),

  // --- Toxicity ---------------------------------------------------------------------------
  onc("mucositis", ["oral mucositis", "stomatitis"], ["chemotherapy", "cycle"], PRIORITY.EXACT_PATIENT),
  onc("tumour lysis syndrome", ["TLS", "tumor lysis", "tumour lysis"], ["leukaemia", "lymphoma", "induction"], PRIORITY.EXACT_PATIENT),
  onc("peripheral neuropathy", ["chemotherapy-induced peripheral neuropathy", "CIPN", "tingling numbness"], ["oxaliplatin", "paclitaxel", "vincristine", "bortezomib"]),
  onc("extravasation", ["drug extravasation", "vesicant extravasation"], ["chemotherapy", "line", "infusion"]),
  onc("infusion reaction", ["hypersensitivity reaction", "rigors during infusion"], ["rituximab", "paclitaxel", "chemotherapy"]),
  onc("hand-foot syndrome", ["palmar plantar erythrodysesthesia", "hand foot"], ["capecitabine", "5-FU"]),
  onc("cardiotoxicity", ["anthracycline cardiotoxicity", "fall in ejection fraction"], ["doxorubicin", "trastuzumab"]),
  onc("cytopenia", ["chemotherapy-induced cytopenia"], ["chemotherapy"]),
  onc("neutropenic enterocolitis", ["typhlitis"], ["neutropenia", "abdominal pain"]),

  // --- Response, staging, performance -------------------------------------------------------
  onc("complete response", ["CR", "complete remission"], ["response", "restaging", "PET"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("partial response", ["PR"], ["response", "restaging"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("stable disease", ["SD"], ["response", "restaging"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("progressive disease", ["PD", "progression"], ["response", "restaging"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("RECIST", ["RECIST 1.1", "recist criteria"], ["response", "restaging"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("ECOG performance status", ["ECOG", "performance status", "PS 1", "PS 2"], ["fitness", "chemotherapy"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("Ann Arbor stage", ["ann arbor", "stage 3B", "stage IIIB"], ["lymphoma"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("B symptoms", ["fever night sweats weight loss"], ["lymphoma"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("PET-CT", ["PET CT", "PET scan", "FDG PET", "Deauville score"], ["staging", "restaging", "lymphoma"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("neoadjuvant", ["neo-adjuvant", "NACT", "neoadjuvant chemotherapy"], ["chemotherapy", "carcinoma"]),
  onc("adjuvant", ["adjuvant chemotherapy"], ["chemotherapy", "carcinoma"]),
  onc("palliative intent", ["palliative chemotherapy", "best supportive care", "BSC"], ["metastatic", "advanced"]),
  onc("line of therapy", ["first line", "second line", "third line"], ["chemotherapy", "progression"]),
  onc("dose reduction", ["dose reduced", "dose modification", "80 percent dose"], ["toxicity", "chemotherapy"]),
  onc("cycle delay", ["cycle deferred", "chemotherapy deferred"], ["counts", "toxicity"]),

  // --- Access ------------------------------------------------------------------------------
  onc("chemoport", ["chemo port", "port-a-cath", "port a cath", "port flush"], ["chemotherapy", "line"], PRIORITY.RELATED),
  onc("PICC line", ["PICC", "peripherally inserted central catheter"], ["chemotherapy", "line"], PRIORITY.RELATED),
  onc("intrathecal chemotherapy", ["IT chemo", "intrathecal methotrexate", "IT cytarabine"], ["leukaemia", "lymphoma", "CNS prophylaxis"], PRIORITY.RELATED),

  // --- Markers -----------------------------------------------------------------------------
  onc("CA 19-9", ["CA nineteen nine"], ["pancreas", "biliary"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("CA 125", ["CA one twenty five"], ["ovarian"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("CEA", ["carcinoembryonic antigen"], ["colorectal"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("AFP", ["alpha fetoprotein"], ["germ cell", "hepatocellular"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("beta-hCG", ["beta HCG"], ["germ cell"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("PSA", ["prostate specific antigen"], ["prostate"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("LDH", ["lactate dehydrogenase"], ["lymphoma", "tumour lysis", "leukaemia"], PRIORITY.SCORING_OR_INVESTIGATION),
  onc("beta-2 microglobulin", ["B2M"], ["myeloma"], PRIORITY.SCORING_OR_INVESTIGATION),
];
