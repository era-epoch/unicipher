import "./global.css";
import {
  english26ToCreepy,
  english26ToGeom,
  english26ToLines,
  english26ToScratches,
} from "./rulesets";
import "./style.css";

const createEmptyRuleset = () => {
  return {
    id: crypto.randomUUID(),
    name: "new ruleset",
    inputSet: "unspecified",
    outputSet: "unspecified",
    map: [
      { in: "A", out: "" },
      { in: "B", out: "" },
      { in: "C", out: "" },
      { in: "D", out: "" },
      { in: "E", out: "" },
      { in: "F", out: "" },
      { in: "G", out: "" },
      { in: "H", out: "" },
      { in: "I", out: "" },
      { in: "J", out: "" },
      { in: "K", out: "" },
      { in: "L", out: "" },
      { in: "M", out: "" },
      { in: "N", out: "" },
      { in: "O", out: "" },
      { in: "P", out: "" },
      { in: "Q", out: "" },
      { in: "R", out: "" },
      { in: "S", out: "" },
      { in: "T", out: "" },
      { in: "U", out: "" },
      { in: "V", out: "" },
      { in: "W", out: "" },
      { in: "X", out: "" },
      { in: "Y", out: "" },
      { in: "Z", out: "" },
    ],
  };
};

const savedRulesetsJSON = localStorage.getItem("rulesets");
const savedRulesets = savedRulesetsJSON ? JSON.parse(savedRulesetsJSON) : [];

const RULESETS = [
  english26ToGeom,
  english26ToCreepy,
  english26ToLines,
  english26ToScratches,
  ...savedRulesets,
  createEmptyRuleset(),
];

let CURR_RULESET = null;

const initEncoder = () => {
  document.getElementById("text-to-encode").addEventListener("input", () => {
    convert();
  });
  document.getElementById("select-ruleset").addEventListener("change", (e) => {
    loadRuleset(e.target.value);
    convert();
  });

  const rulesetContainer = document.getElementById("select-ruleset");
  for (const ruleset of RULESETS) {
    const option = document.createElement("option");
    option.value = ruleset.id;
    option.innerHTML = ruleset.name;
    rulesetContainer.appendChild(option);
  }
};

const loadRuleset = (rulesetId) => {
  const ruleset = getRuleset(rulesetId);
  const container = document.getElementById("new-ruleset");
  container.innerHTML = ``;
  for (const mapping of ruleset.map) {
    const rule = document.createElement("rule");
    rule.innerHTML = `
    <input
      class="in-text"
      type="text"
      maxlength="1"
      title="this character"
      value="${mapping.in}"
    />
    <div title="is encoded as">➤</div>
    <input
      class="out-text"
      type="text"
      maxlength="1"
      title="this other character"
      value="${mapping.out}"
    />
    `;
    container.appendChild(rule);
  }
  CURR_RULESET = ruleset;
  document.getElementById("ruleset-name").value = ruleset.name;
};

const getRuleset = (id) => {
  return (
    RULESETS.find((rs) => rs.id == id) ??
    console.error("No ruleset found with id " + id)
  );
};

const cloneRuleset = (ruleset) => {
  const it = ruleset.name.match(/\[\d+\]/);
  const next =
    it && it.length > 0 ? parseInt(it[0].slice(1, it[0].length - 1)) + 1 : 1;
  return {
    id: crypto.randomUUID(),
    name: `${
      it && it.length > 0
        ? ruleset.name.slice(0, ruleset.name.indexOf(it[0]) - 1)
        : ruleset.name
    } [${next}]`,
    inputSet: ruleset.inputSet,
    outputSet: ruleset.outputSet,
    map: structuredClone(ruleset.map),
  };
};

const convert = () => {
  const intext = document.getElementById("text-to-encode").value;
  const rulesetId = document.getElementById("select-ruleset").value;
  const ruleset = getRuleset(rulesetId);
  let out = "";
  for (const char of intext.toUpperCase()) {
    let mapped = false;
    for (const mapping of ruleset.map) {
      if (mapping.in == char) {
        out += mapping.out;
        mapped = true;
        break;
      }
    }
    if (!mapped) out += char;
  }
  document.getElementById("encoded-text").value = out;
};

const randomizeRuleset = (ruleset) => {
  const clone = cloneRuleset(ruleset);
  const outputs = clone.map.reduce((acc, curr) => {
    acc.push(curr.out);
    return acc;
  }, []);
  let i = 0;
  while (outputs.length > 0) {
    const index = Math.floor(Math.random() * outputs.length);
    const val = outputs.splice(index, 1);
    clone.map[i].out = val;
    i++;
  }
  return clone;
};

const randomize = () => {
  const randomized = randomizeRuleset(CURR_RULESET);
  RULESETS.push(randomized);
  loadRuleset(randomized.id);
};

const save = () => {
  if (RULESETS.some((r) => r.id == CURR_RULESET.id)) {
    CURR_RULESET.id = crypto.randomUUID();
  }
  RULESETS.push(CURR_RULESET);
  savedRulesets.push(CURR_RULESET);
  localStorage.setItem("rulesets", JSON.stringify(savedRulesets));
};

const copy = () => {
  navigator.clipboard.writeText(JSON.stringify(CURR_RULESET));
};

const initMenu = () => {
  document.getElementById("randomize").addEventListener("click", randomize);
  document.getElementById("save").addEventListener("click", save);
  document.getElementById("copy").addEventListener("click", copy);
  document.getElementById("ruleset-name").addEventListener("change", (e) => {
    CURR_RULESET.name = e.target.value;
  });
};

// Lifecycle

const onLoad = () => {
  loadRuleset("3a352376-1d40-4b7f-a3db-38280fc782eb");
  initEncoder();
  initMenu();
  convert();
};

window.addEventListener("load", onLoad);
