export interface Sentence {
  en: string;
  fr: string[];
}

// English prompts paired with acceptable French translations.
// The first French entry is the "primary" one shown by the Show answer button;
// the rest are other wordings, registers (tu/vous), or genders that translate
// the English just as well (the English is deliberately ambiguous about tense,
// gender, and formality, so several French sentences are correct). Matching is
// case- and punctuation-insensitive but accent- and apostrophe-sensitive (see
// normalise in french-drill.tsx), so entries only need to list genuinely
// different wordings, not comma or capitalisation variants.
export const sentences: Sentence[] = [
  // how has your vacation been?
  {
    en: "How has your holiday been?",
    fr: [
      "Comment se sont passées tes vacances ?",
      "Comment se sont passées vos vacances ?",
      "Comment étaient tes vacances ?",
      "Comment étaient vos vacances ?",
      "Tes vacances se sont bien passées ?",
      "Vos vacances se sont bien passées ?",
    ],
  },
  // I must apologise for cancelling last time
  {
    en: "I must apologise for cancelling last time.",
    fr: [
      "Je dois m'excuser d'avoir annulé la dernière fois.",
      "Je dois m'excuser pour avoir annulé la dernière fois.",
      "Je dois vous présenter mes excuses pour avoir annulé la dernière fois.",
    ],
  },
  // we discovered that the gardener cut the wire
  {
    en: "We discovered that the gardener had cut the wire.",
    fr: [
      "Nous avons découvert que le jardinier avait coupé le fil.",
      "On a découvert que le jardinier avait coupé le fil.",
      "Nous avons découvert que le jardinier avait coupé le câble.",
      "On a découvert que le jardinier avait coupé le câble.",
    ],
  },
  // annoyed / angry
  {
    en: "I was annoyed, but not angry.",
    fr: [
      "J'étais agacé, mais pas en colère.",
      "J'étais agacée, mais pas en colère.",
      "J'étais énervé, mais pas en colère.",
      "J'étais énervée, mais pas en colère.",
      "J'étais énervé, mais pas fâché.",
      "J'étais énervée, mais pas fâchée.",
      "J'étais contrarié, mais pas en colère.",
      "J'étais contrariée, mais pas en colère.",
    ],
  },
  // I would cancel
  {
    en: "If I were you, I would cancel.",
    fr: [
      "Si j'étais toi, j'annulerais.",
      "Si j'étais vous, j'annulerais.",
      "À ta place, j'annulerais.",
      "À votre place, j'annulerais.",
    ],
  },
  // you are betting against other customers, not the company
  {
    en: "You are betting against other customers, not the company.",
    fr: [
      "Tu paries contre les autres clients, pas contre l'entreprise.",
      "Vous pariez contre les autres clients, pas contre l'entreprise.",
      "Tu paries contre d'autres clients, pas contre l'entreprise.",
      "Vous pariez contre d'autres clients, pas contre l'entreprise.",
      "Tu paries contre les autres clients, pas contre la société.",
      "Vous pariez contre les autres clients, pas contre la société.",
      "Tu paries contre les autres clients, et non contre l'entreprise.",
      "Vous pariez contre les autres clients, et non contre l'entreprise.",
    ],
  },
  // it is moving, but it takes time
  {
    en: "It is moving, but it takes time.",
    fr: [
      "Ça avance, mais ça prend du temps.",
      "Ça bouge, mais ça prend du temps.",
      "Cela avance, mais cela prend du temps.",
      "Ça progresse, mais ça prend du temps.",
    ],
  },
  // applied for
  {
    en: "I applied for the job last week.",
    fr: [
      "J'ai postulé pour le poste la semaine dernière.",
      "J'ai postulé au poste la semaine dernière.",
      "J'ai postulé pour l'emploi la semaine dernière.",
      "J'ai posé ma candidature pour le poste la semaine dernière.",
      "J'ai posé ma candidature au poste la semaine dernière.",
    ],
  },
  // slow
  {
    en: "The process is slow.",
    fr: [
      "Le processus est lent.",
      "La procédure est lente.",
      "Le processus est très lent.",
    ],
  },
  // "under review"
  {
    en: "My application is still under review.",
    fr: [
      "Ma candidature est toujours en cours d'examen.",
      "Ma candidature est encore en cours d'examen.",
      "Ma demande est toujours en cours d'examen.",
      "Ma demande est encore en cours d'examen.",
      "Ma candidature est toujours à l'étude.",
      "Ma candidature est encore à l'étude.",
      "Ma demande est toujours à l'étude.",
      "Ma demande est encore à l'étude.",
    ],
  },
  // would pay
  {
    en: "The company would pay for the lessons.",
    fr: [
      "L'entreprise paierait les cours.",
      "L'entreprise payerait les cours.",
      "La société paierait les cours.",
      "La société payerait les cours.",
      "L'entreprise paierait pour les cours.",
      "L'entreprise payerait pour les cours.",
    ],
  },
  // would cost
  {
    en: "It would cost too much.",
    fr: [
      "Ça coûterait trop cher.",
      "Cela coûterait trop cher.",
      "Ça coûterait trop.",
    ],
  },
  // socialising good for you
  {
    en: "Socialising is good for you.",
    fr: [
      "Socialiser, c'est bon pour toi.",
      "Socialiser, c'est bon pour vous.",
      "Socialiser est bon pour toi.",
      "Socialiser est bon pour vous.",
      "Voir du monde, c'est bon pour toi.",
      "Voir du monde, c'est bon pour vous.",
      "Socialiser te fait du bien.",
      "Socialiser vous fait du bien.",
      "Voir du monde te fait du bien.",
      "Voir du monde vous fait du bien.",
    ],
  },
  // i would save money, and have more time
  {
    en: "I would save money, and have more time.",
    fr: [
      "J'économiserais de l'argent et j'aurais plus de temps.",
      "J'économiserais de l'argent et aurais plus de temps.",
      "Je ferais des économies et j'aurais plus de temps.",
      "Je ferais des économies et aurais plus de temps.",
    ],
  },
  // will not offer to me ...
  {
    en: "They will not offer me the job.",
    fr: [
      "Ils ne me proposeront pas le poste.",
      "Ils ne m'offriront pas le poste.",
      "Ils ne me proposeront pas l'emploi.",
      "Ils ne m'offriront pas l'emploi.",
      "Ils ne vont pas me proposer le poste.",
      "Ils ne vont pas m'offrir le poste.",
    ],
  },
  // real
  {
    en: "It is a real problem.",
    fr: [
      "C'est un vrai problème.",
      "C'est un véritable problème.",
      "C'est un problème réel.",
    ],
  },
  // listen
  {
    en: "Listen, I have an idea.",
    fr: ["Écoute, j'ai une idée.", "Écoutez, j'ai une idée."],
  },
  // the tune
  {
    en: "I know the tune, but not the words.",
    fr: [
      "Je connais l'air, mais pas les paroles.",
      "Je connais la mélodie, mais pas les paroles.",
    ],
  },
  // swings in the park
  {
    en: "There are swings in the park.",
    fr: [
      "Il y a des balançoires dans le parc.",
      "Il y a des balançoires au parc.",
    ],
  },
  // rope swing
  {
    en: "The children love the rope swing.",
    fr: [
      "Les enfants adorent la balançoire à corde.",
      "Les enfants adorent la balançoire en corde.",
      "Les enfants aiment la balançoire à corde.",
      "Les enfants aiment la balançoire en corde.",
    ],
  },
  // sand (sand pit)
  {
    en: "She plays in the sand pit.",
    fr: ["Elle joue dans le bac à sable.", "Elle joue dans le sable."],
  },
  // he weighs 13 kg
  {
    en: "He weighs 13 kilos.",
    fr: [
      "Il pèse treize kilos.",
      "Il pèse 13 kilos.",
      "Il pèse treize kilogrammes.",
      "Il pèse 13 kilogrammes.",
      "Il pèse 13 kg.",
    ],
  },
  // his key worker
  {
    en: "His key worker speaks French.",
    fr: [
      "Son référent parle français.",
      "Sa référente parle français.",
      "Son éducateur référent parle français.",
      "Son éducatrice référente parle français.",
      "Sa personne de référence parle français.",
    ],
  },
  // the children get a french teacher from the school
  {
    en: "The children get a French teacher from the school.",
    fr: [
      "Les enfants ont un professeur de français de l'école.",
      "Les enfants ont une professeure de français de l'école.",
      "Les enfants ont un prof de français de l'école.",
      "L'école donne aux enfants un professeur de français.",
      "L'école fournit un professeur de français aux enfants.",
      "L'école fournit aux enfants un professeur de français.",
    ],
  },
  // soon
  {
    en: "We will move house soon.",
    fr: [
      "Nous allons déménager bientôt.",
      "On va déménager bientôt.",
      "Nous allons bientôt déménager.",
      "On va bientôt déménager.",
      "Nous déménagerons bientôt.",
      "On déménagera bientôt.",
    ],
  },
  // look
  { en: "Look at the sky.", fr: ["Regarde le ciel.", "Regardez le ciel."] },
  // trust
  {
    en: "I trust him.",
    fr: ["Je lui fais confiance.", "J'ai confiance en lui."],
  },
  // first part
  {
    en: "The first part was easy.",
    fr: [
      "La première partie était facile.",
      "La première partie a été facile.",
    ],
  },
  // snow
  {
    en: "It snowed in the mountains last night.",
    fr: [
      "Il a neigé dans les montagnes hier soir.",
      "Il a neigé à la montagne hier soir.",
      "Il a neigé dans les montagnes cette nuit.",
      "Il a neigé à la montagne cette nuit.",
    ],
  },
];
