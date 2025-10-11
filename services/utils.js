import API from "./api";
import moment, {now} from "moment";

export const convertSecToHumanTiming = (seconds) => {
  if (!seconds || seconds === 0) {
    return 0;
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  let result = '';

  if (h > 0) result += `${h}h`;
  if (m > 0) result += `${m}m`;
  if (s > 0) result += `${s}s`;

  return result;
};


export const convertMettersToHumanDistance = (meters) => {
  if (meters < 1000) {
    return meters + 'm';
  }

  if (meters % 1000 === 0) {
    return meters / 1000 + 'km';
  }

  return meters / 1000 + 'km' + meters % 1000;
}

export const extractAllToolsFromSession = (session) => {
  let tools = []
  session?.series?.forEach(serie => {
    serie.exercise_configurations?.forEach(exerciseConf => {
      if (exerciseConf?.exercise?.tools.length > 0) {
        exerciseConf.exercise.tools.forEach(tool => {
          if (!tools.map(tool => tool.name).includes(tool.name)) {
            tools.push(tool)
          }
        })
      }
    })
  })

  return tools
}


const coefByMood = (mood) => {
  switch (mood) {
    case 1:
      return 0.12495;
    case 2:
      return 0.249975;
    case 3:
      return 0.4995;
    case 4:
      return 0.6;
    default:
      return 0
  }
}

export const fetchSessionsForActivityIndex = async (healthData) => {
  let totalScore = 0;

  if(healthData?.totalScore && healthData?.createdAt) {
    let daysSinceCreation = moment().diff(moment(healthData.createdAt), 'days');

    if (daysSinceCreation < 7) {
      // Calcul du coefficient de décroissance (7-jours)/7
      const decayCoefficient = (7 - daysSinceCreation) / 7;
      totalScore += healthData.totalScore * decayCoefficient;
    }
  }

  try {
    const dateMin = moment(now()).add(-7, "day").format("YYYY-MM-DD");
    const dateMax = moment(now()).add(1, "day").format("YYYY-MM-DD");

    const response = await API.get(
      `/calendar-element/findMyElements?dateMin=${dateMin}&dateMax=${dateMax}&state=finished`
    );

    const calEls = response.data?.results

    if (!calEls || calEls.length === 0) {
      const response = await API.get(
        `/calendar-element/findMyElements?dateMin=2025-01-01`
      );
      const calEls = response.data?.results
      if (calEls && calEls.length > 0) {
        return totalScore || 0
      }

      return totalScore || null
    }

    calEls.forEach(calEl => {
      if (calEl.state === 'finished') {
        totalScore += coefByMood(calEl.mood) * calEl.realDuration / 60
      }
    })

    return totalScore;
  } catch (error) {
    console.error("Erreur lors du chargement de l'index d'activité physique :", error);
    return totalScore || null;
  }
};

export const getActivityIndexByWeek = async () => {
  const today = moment();
  const currentMonth = today.month(); // 0-based
  const currentYear = today.year();

  const startOfMonth = moment([currentYear, currentMonth, 1]);
  const endOfMonth = moment(startOfMonth).endOf('month');

  // Début de la première semaine complète (lundi) couvrant le mois
  const firstWeekStart = moment(startOfMonth).startOf('week').add(1, 'day'); // lundi
  // Fin de la dernière semaine complète (dimanche) couvrant le mois
  const lastWeekEnd = moment(endOfMonth).endOf('week').add(1, 'day'); // dimanche

  const dateMin = firstWeekStart.format("YYYY-MM-DD");
  const dateMax = lastWeekEnd.format("YYYY-MM-DD");

  // Appel unique à l'API
  const response = await API.get(
    `/calendar-element/findMyElements?dateMin=${dateMin}&dateMax=${dateMax}&state=finished`
  );

  const calEls = response.data?.results || [];

  // Grouper les événements par semaine (clé : 'YYYY-MM-DD|YYYY-MM-DD')
  const weeksMap = new Map();

  calEls.forEach(calEl => {
    const elDate = moment(calEl.date);
    const weekStart = moment(elDate).startOf('week').add(1, 'day').format('YYYY-MM-DD'); // lundi
    const weekEnd = moment(weekStart).add(6, 'days').format('YYYY-MM-DD'); // dimanche

    const weekKey = `${weekStart}|${weekEnd}`;

    if (!weeksMap.has(weekKey)) {
      weeksMap.set(weekKey, []);
    }
    weeksMap.get(weekKey).push(calEl);
  });


  const results = [];

  // Itérer sur toutes les semaines entre firstWeekStart et lastWeekEnd
  let cursor = firstWeekStart.clone();

  while (cursor.isSameOrBefore(lastWeekEnd)) {
    const weekStart = cursor.format('YYYY-MM-DD');
    const weekEnd = cursor.clone().add(6, 'days').format('YYYY-MM-DD');
    const weekKey = `${weekStart}|${weekEnd}`;

    const events = weeksMap.get(weekKey) || [];

    let totalScore = 0;
    events.forEach(calEl => {
      totalScore += coefByMood(calEl.mood) * calEl.realDuration / 60;
    });

    results.push({
      weekStart,
      weekEnd,
      activityIndex: parseInt(totalScore.toFixed(0)),
    });

    cursor.add(7, 'days');
  }

  // Trier par date de début
  results.sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

  return results;
};


export const getActivityIndexByMonth = async () => {
  const currentYear = moment().year();
  const currentMonth = moment().month();
  const currentDay = moment().date();

  const dateMin = moment([currentYear, 0, 1]).format("YYYY-MM-DD"); // 1er janvier
  const dateMax = moment([currentYear, 11, 31]).format("YYYY-MM-DD"); // 31 décembre

  // Appel unique à l'API
  const response = await API.get(
    `/calendar-element/findMyElements?dateMin=${dateMin}&dateMax=${dateMax}&state=finished`
  );

  const calEls = response.data?.results || [];

  // Grouper les éléments par mois (YYYY-MM)
  const monthsMap = new Map();
  calEls.forEach(calEl => {
    const elDate = moment(calEl.date);
    const monthKey = elDate.format('YYYY-MM');

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, []);
    }
    monthsMap.get(monthKey).push(calEl);
  });

  const results = [];

  // Générer les 12 mois de l'année, de janvier à décembre
  for (let m = 0; m < 12; m++) {
    const monthMoment = moment([currentYear, m]);
    const monthKey = monthMoment.format('YYYY-MM');
    const events = monthsMap.get(monthKey) || [];

    let totalScore = 0;
    events.forEach(calEl => {
      totalScore += coefByMood(calEl.mood) * calEl.realDuration / 60;
    });

    let normalizedScore;
    if (m === currentMonth) {
      // Pour le mois en cours, on normalise sur le nombre de jours passés
      const daysPassed = currentDay;
      const weeksPassed = daysPassed / 7;
      normalizedScore = weeksPassed > 0 ? totalScore / weeksPassed : 0;
    } else {
      // Pour les autres mois, on normalise sur le nombre total de semaines du mois
      const daysInMonth = monthMoment.daysInMonth();
      const weeksInMonth = daysInMonth / 7;
      normalizedScore = weeksInMonth > 0 ? totalScore / weeksInMonth : 0;
    }

    results.push({
      month: monthKey,
      activityIndex: parseInt(normalizedScore.toFixed(0)),
    });
  }

  return results;
};


export const getSessionDuration = (session) => {
  let duration = 0;

  session?.series?.forEach(serie => {
    let serieDuration = 0
    serie?.exercise_configurations.forEach(exC => {
      serieDuration += exC.duration
    })
    duration += serieDuration * serie.repetitions
  })

  return duration
}

export const getCardColorsByState = (state) => {
  switch (state) {
    case "planned":
      return {backgroundColor: "#E1F5FE", textColor: "#01579B"};
    case "finished":
      return {backgroundColor: "#E8F5E9", textColor: "#2E7D32"};
    default:
      return {backgroundColor: "#FFEBEE", textColor: "#C62828"};
  }
};
export const getSessionStateColor = (state) => {
  switch (state) {
    case "finished":
      return "#4CAF50";
    case "planned":
      return "#FFC107";
    default:
      return "#90A4AE";
  }
};

export const translateSessionState = (state) => {
  switch (state) {
    case "finished":
      return "Terminé";
    case "planned":
      return "À faire";
    default:
      return "";
  }
};
