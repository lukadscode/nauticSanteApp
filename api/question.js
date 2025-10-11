const questions = [
  {
    id: "0",
    category: "Informations Personnelles",
    question: "Quel est votre poids (kg) et votre taille (cm) ?",
    isPersonal: true,
    inputs: [
      { label: "Poids (kg)", key: "weight" },
      { label: "Taille (cm)", key: "height" },
    ],
  },
  // Section A: Comportements Sédentaires
  {
    id: "A1",
    category: "Comportements Sédentaires",
    question: "Combien de temps passez-vous en position assise par jour ?",
    options: [
      { label: "+ de 5 h", value: 1, icon: "time-outline" },
      { label: "4 à 5 h", value: 2, icon: "hourglass-outline" },
      { label: "3 à 4 h", value: 3, icon: "hourglass" },
      { label: "2 à 3 h", value: 4, icon: "time" },
      { label: "Moins de 2 h", value: 5, icon: "happy-outline" },
    ],
  },

  // Section B: Activités Physiques de Loisir
  {
    id: "B1",
    category: "Activités Physiques de Loisir",
    question: "Pratiquez-vous régulièrement une ou des activités physiques ?",
    options: [
      { label: "Non", value: 1, icon: "close-circle-outline" },
      { label: "Oui", value: 5, icon: "checkmark-circle-outline" },
    ],
  },
  {
    id: "B2",
    category: "Activités Physiques de Loisir",
    question: "À quelle fréquence pratiquez-vous l’ensemble de ces activités ?",
    options: [
      { label: "1 à 2 fois par mois", value: 1, icon: "calendar-outline" },
      { label: "1 fois par semaine", value: 2, icon: "calendar-outline" },
      { label: "2 fois par semaine", value: 3, icon: "calendar-outline" },
      { label: "3 fois par semaine", value: 4, icon: "calendar-outline" },
      { label: "4 fois par semaine", value: 5, icon: "calendar-outline" },
    ],
  },
  {
    id: "B3",
    category: "Activités Physiques de Loisir",
    question: "Combien de minutes consacrez-vous en moyenne à chaque séance ?",
    options: [
      { label: "Moins de 15 min", value: 1, icon: "time-outline" },
      { label: "16 à 30 min", value: 2, icon: "time" },
      { label: "31 à 45 min", value: 3, icon: "stopwatch-outline" },
      { label: "46 à 60 min", value: 4, icon: "timer-outline" },
      { label: "Plus de 60 min", value: 5, icon: "happy-outline" },
    ],
  },
  {
    id: "B4",
    category: "Activités Physiques de Loisir",
    question: "Habituellement, comment percevez-vous votre effort ?",
    options: [
      { label: "Très facile", value: 1, icon: "happy-outline" },
      { label: "Facile", value: 2, icon: "happy-outline" },
      {
        label: "Moyennement difficile",
        value: 3,
        icon: "remove-circle-outline",
      },
      { label: "Difficile", value: 4, icon: "sad-outline" },
      { label: "Très difficile", value: 5, icon: "flame-outline" },
    ],
  },

  // Section C: Activités Physiques Quotidiennes
  {
    id: "C1",
    category: "Activités Physiques Quotidiennes",
    question:
      "Quelle intensité d’activité physique votre travail requiert-il ?",
    options: [
      { label: "Légère", value: 1, icon: "walk-outline" },
      { label: "Modérée", value: 2, icon: "bicycle-outline" },
      { label: "Moyenne", value: 3, icon: "fitness-outline" },
      { label: "Intense", value: 4, icon: "barbell-outline" },
      { label: "Très intense", value: 5, icon: "flame-outline" },
    ],
  },
  {
    id: "C2",
    category: "Activités Physiques Quotidiennes",
    question:
      "En dehors de votre travail, combien d’heures par semaine consacrez-vous aux travaux légers (bricolage, jardinage, ménages) ?",
    options: [
      { label: "Moins de 2 h", value: 1, icon: "time-outline" },
      { label: "3 à 4 h", value: 2, icon: "hourglass-outline" },
      { label: "5 à 6 h", value: 3, icon: "hourglass" },
      { label: "7 à 9 h", value: 4, icon: "time" },
      { label: "Plus de 10 h", value: 5, icon: "checkmark-outline" },
    ],
  },
  {
    id: "C3",
    category: "Activités Physiques Quotidiennes",
    question: "Combien de minutes par jour consacrez-vous à la marche ?",
    options: [
      { label: "Moins de 15 min", value: 1, icon: "walk-outline" },
      { label: "16 à 30 min", value: 2, icon: "footsteps-outline" },
      { label: "31 à 45 min", value: 3, icon: "timer-outline" },
      { label: "46 à 60 min", value: 4, icon: "time-outline" },
      { label: "Plus de 60 min", value: 5, icon: "happy-outline" },
    ],
  },
  {
    id: "C4",
    category: "Activités Physiques Quotidiennes",
    question: "Combien d’étages, en moyenne, montez-vous à pied chaque jour ?",
    options: [
      { label: "Moins de 2", value: 1, icon: "stairs-outline" },
      { label: "3 à 5", value: 2, icon: "stairs-outline" },
      { label: "6 à 10", value: 3, icon: "stairs-outline" },
      { label: "11 à 15", value: 4, icon: "stairs-outline" },
      { label: "Plus de 16", value: 5, icon: "stairs-outline" },
    ],
  },
];

export default questions;
