/* ============================================================
   ESLAM DAWOUD â€” Content & Data
   All factual content lives here. Strings prefixed with "@"
   are translated through i18n.js (key lookup).
   ============================================================ */

/* global ED_I18N */

const ED_DATA = {
  profile: {
    name: "ESLAM DAWOUD",
    fullName: "Eslam Mohamed Fathy Dawoud",
    shortName: "ESLAM",
    role: "Software Engineer / Full-Stack Developer",
    special: "Full-Stack .NET Development",
    location: "@profile.locValue",
    email: "eslammohamed010606@gmail.com",
    phoneDisplay: "+20 10 60627954",
    phoneTel: "+201060627954",
    linkedin: "https://www.linkedin.com/in/eslam-dawoud-820639372",
    github: "https://github.com/Eslam010606",
    githubUser: "Eslam010606",
    githubRepoPattern: "https://github.com/Eslam010606/{name}",
    cv: "assets/ESLAM_DAWOUD_CV.pdf",
    ogUrl: "https://github.com/Eslam010606/",
  },

  /* Skill tokens: "@key" are translated; plain strings are tech names. */
  skills: {
    languages: ["C#", "C++", "Python", "Dart", "JavaScript", "HTML", "CSS", "SQL"],
    backend: [".NET", "ASP.NET Core", "Web API", "Entity Framework Core", "@skills.flutter"],
    data: ["SQL Server", "Git"],
    core: ["@skills.coreFullStack", "@skills.coreDb", "@skills.coreApi", "@skills.coreOop"],
    featured: ["C#", ".NET", "ASP.NET Core", "Web API", "Entity Framework Core", "SQL Server"],
    featureIcons: {
      "C#": "cs", ".NET": "dot", "ASP.NET Core": "core",
      "Web API": "api", "Entity Framework Core": "ef", "SQL Server": "sql",
    },
  },

  /* Development stack flow (labels/descriptions resolved via i18n "stack.layers[n]"). */
  stack: [
    { id: "front", icon: "front" },
    { id: "api",   icon: "api" },
    { id: "core",  icon: "core" },
    { id: "ef",    icon: "ef" },
    { id: "sql",   icon: "sql" },
  ],

  experience: [
    {
      key: "depi",
      company: "@xp.depiCompany",
      role: "@xp.depiRole",
      location: "@profile.locValue",
      period: "@xp.depiPeriod",
      chips: [".NET", "C#", "ASP.NET Core", "SQL Server"],
      desc: [
        "@xp.depiDesc1",
        "@xp.depiDesc2",
        "@xp.depiDesc3",
      ],
    },
  ],

  education: [
    {
      key: "capital",
      degree: "@edu.degree",
      institution: "@edu.institution",
      location: "@profile.locValue",
      period: "@edu.period",
    },
  ],

  depi: {
    company: "@depi.company",
    role: "@depi.role",
    period: "@depi.period",
    tech: ["C#", ".NET", "ASP.NET Core", "Web API", "Entity Framework Core", "SQL Server", "Git"],
    steps: [0, 1, 2, 3], /* indexes into i18n depi.steps */
  },

  projects: [
    {
      id: "library",
      index: "01",
      name: "@projects.item0.name",
      type: "@projects.item0.type",
      tags: ["c++", "academic"],
      concept: "@projects.item0.concept",
      thumbnail: "Library",
      summary: "@projects.item0.summary",
      features: ["@projects.item0.features1", "@projects.item0.features2", "@projects.item0.features3", "@projects.item0.features4"],
      tech: ["C++", "OOP"],
      github: null,
      demo: null,
    },
    {
      id: "smartstore",
      index: "02",
      name: "@projects.item1.name",
      type: "@projects.item1.type",
      tags: ["c++", "academic"],
      concept: "@projects.item1.concept",
      thumbnail: "Store",
      summary: "@projects.item1.summary",
      features: ["@projects.item1.features1", "@projects.item1.features2", "@projects.item1.features3", "@projects.item1.features4"],
      tech: ["C++", "OOP"],
      github: null,
      demo: null,
    },
  ],

  /* Service ids maps to i18n "services.items[i]". */
  services: ["webdev", "api", "database", "fullstack", "existing"],

  /* Why ids map to i18n "why.items[<id>]". */
  why: ["clean", "oop", "apidev", "db", "fullstack", "solving", "learning", "user"],
};

/* Resolve a data token to a translated string (or raw string). */
function edT(dataToken) {
  if (typeof dataToken === "string" && dataToken.startsWith("@")) {
    return ED_I18N.gt(ED_I18N.lang || "en", dataToken.slice(1));
  }
  return dataToken;
}

window.ED_DATA = ED_DATA;
window.edT = edT;