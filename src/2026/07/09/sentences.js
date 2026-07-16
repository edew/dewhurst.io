// English prompts paired with acceptable French translations.
// The first French entry is the "primary" one shown by the Show answer button,
// and is the sentence's target tense; the rest are other conjugations or
// tenses that translate the English just as well (the English is deliberately
// ambiguous about tense, gender, and formality, so several French sentences
// are correct). Matching is case- and punctuation-insensitive but accent- and
// apostrophe-sensitive (see normalise in script.js), so entries only need to
// list genuinely different wordings, not comma or capitalisation variants.
export const sentences = [
  // passé composé (+ literary passé simple)
  { en: "He took the train this morning.", fr: ["Il a pris le train ce matin.", "Il prit le train ce matin."] },
  // imparfait + passé composé (+ literary passé simple in the second clause)
  { en: "I was reading a book when the phone rang.", fr: ["Je lisais un livre quand le téléphone a sonné.", "Je lisais un livre lorsque le téléphone a sonné.", "Je lisais un livre quand le téléphone sonna."] },
  // conditionnel présent
  { en: "He would travel by train if he could.", fr: ["Il voyagerait en train s'il pouvait."] },
  // conditionnel passé
  { en: "She should have called her mother.", fr: ["Elle aurait dû appeler sa mère.", "Elle aurait dû téléphoner à sa mère."] },
  // subjonctif présent
  { en: "It is necessary that he finish the work.", fr: ["Il faut qu'il finisse le travail.", "Il faut qu'il termine le travail.", "Il est nécessaire qu'il finisse le travail."] },
  // subjonctif présent (covers the future)
  { en: "I doubt that they will come.", fr: ["Je doute qu'ils viennent.", "Je doute qu'elles viennent."] },
  // plus-que-parfait (speaker's gender is unspecified)
  { en: "She had already left when I arrived.", fr: ["Elle était déjà partie quand je suis arrivé.", "Elle était déjà partie quand je suis arrivée.", "Elle était déjà partie lorsque je suis arrivé.", "Elle était déjà partie lorsque je suis arrivée."] },
  // plus-que-parfait
  { en: "I had never seen such a thing.", fr: ["Je n'avais jamais vu une telle chose.", "Je n'avais jamais vu une chose pareille."] },
  // passé simple (literary) + everyday passé composé
  { en: "The king died in 1715.", fr: ["Le roi mourut en 1715.", "Le roi est mort en 1715."] },
  // passé simple (literary) + everyday passé composé
  { en: "She was born in spring.", fr: ["Elle naquit au printemps.", "Elle est née au printemps."] },
  // passé antérieur + passé simple; in speech the passé antérieur becomes the
  // passé surcomposé (or a plain passé composé) and the passé simple main verb
  // becomes passé composé
  { en: "As soon as he had finished, he left.", fr: ["Dès qu'il eut fini, il partit.", "Aussitôt qu'il eut fini, il partit.", "Dès qu'il eut terminé, il partit.", "Dès qu'il a eu fini, il est parti.", "Aussitôt qu'il a eu fini, il est parti.", "Dès qu'il a eu terminé, il est parti.", "Dès qu'il a fini, il est parti.", "Aussitôt qu'il a fini, il est parti.", "Dès qu'il a terminé, il est parti."] },
  // futur simple (+ futur proche)
  { en: "Tomorrow I will go to the market.", fr: ["Demain j'irai au marché.", "Demain je vais aller au marché."] },
  // futur simple (+ futur proche); subject's gender is unspecified
  { en: "They will be going to the beach tomorrow.", fr: ["Ils iront à la plage demain.", "Elles iront à la plage demain.", "Ils vont aller à la plage demain.", "Elles vont aller à la plage demain."] },
  // futur antérieur; subject's gender is unspecified
  { en: "By tomorrow, they will have finished the work.", fr: ["D'ici demain, ils auront fini le travail.", "D'ici demain, elles auront fini le travail.", "D'ici demain, ils auront terminé le travail.", "D'ici demain, elles auront terminé le travail."] },
  // futur antérieur
  { en: "He will have finished before noon.", fr: ["Il aura fini avant midi.", "Il aura terminé avant midi."] },
  // passé composé with être (+ literary passé simple); group's gender is unspecified
  { en: "We arrived late last night.", fr: ["Nous sommes arrivés tard hier soir.", "Nous sommes arrivées tard hier soir.", "Nous arrivâmes tard hier soir."] },
  // conditionnel présent
  { en: "I would like a glass of red wine.", fr: ["Je voudrais un verre de vin rouge.", "J'aimerais un verre de vin rouge."] },
  // imparfait (habitual "would")
  { en: "Every summer, we would go to the mountains.", fr: ["Chaque été, nous allions à la montagne.", "Chaque été, on allait à la montagne."] },
  // passé composé / imparfait mix ("thought" and "could" each allow two tenses)
  { en: "I thought that I could help.", fr: ["J'ai pensé que je pouvais aider.", "Je pensais que je pouvais aider.", "Je croyais que je pouvais aider.", "J'ai cru que je pouvais aider."] },
  // subjonctif présent
  { en: "Although she is tired, she keeps working.", fr: ["Bien qu'elle soit fatiguée, elle continue de travailler.", "Bien qu'elle soit fatiguée, elle continue à travailler."] },
];
