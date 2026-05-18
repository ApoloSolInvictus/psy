export type SafetyFlag =
  | "none"
  | "self_harm"
  | "suicide"
  | "harm_to_others"
  | "abuse"
  | "medical_emergency"
  | "psychosis_or_loss_of_control";

export type SafetyResult = {
  flag: SafetyFlag;
  isCrisis: boolean;
  matched: string[];
};

const patterns: Array<{ flag: SafetyFlag; terms: RegExp[] }> = [
  {
    flag: "suicide",
    terms: [
      /suicid/i,
      /quitarme la vida/i,
      /no quiero vivir/i,
      /quiero morir/i,
      /me voy a matar/i,
      /despedirme de todos/i
    ]
  },
  {
    flag: "self_harm",
    terms: [
      /hacerme daño/i,
      /autoles/i,
      /cortarme/i,
      /lastimarme/i,
      /herirme/i,
      /me quiero dañar/i
    ]
  },
  {
    flag: "harm_to_others",
    terms: [
      /matar a alguien/i,
      /hacerle daño a/i,
      /golpear a/i,
      /voy a atacar/i,
      /quiero herir/i
    ]
  },
  {
    flag: "abuse",
    terms: [/abuso/i, /abusaron/i, /violaci/i, /me viol/i, /maltrato/i, /violencia/i]
  },
  {
    flag: "medical_emergency",
    terms: [/sobredosis/i, /no puedo respirar/i, /dolor en el pecho/i, /emergencia médica/i]
  },
  {
    flag: "psychosis_or_loss_of_control",
    terms: [
      /voces me dicen/i,
      /alucin/i,
      /me persiguen/i,
      /perdiendo el control/i,
      /no puedo controlar/i
    ]
  }
];

export function detectCrisis(text: string): SafetyResult {
  const matched: string[] = [];

  for (const group of patterns) {
    const hits = group.terms.filter((term) => term.test(text)).map((term) => term.source);
    if (hits.length > 0) {
      matched.push(...hits);
      return { flag: group.flag, isCrisis: true, matched };
    }
  }

  return { flag: "none", isCrisis: false, matched };
}

export function crisisResponse(flag: SafetyFlag) {
  const context =
    flag === "harm_to_others"
      ? "Me importa la seguridad de todos los involucrados."
      : "Siento mucho que estés pasando por esto. Tu seguridad va primero.";

  return `${context}

Si hay peligro inmediato, llama a emergencias locales ahora. En EE. UU. puedes llamar o enviar texto al 988 para crisis suicida o emocional; para peligro inmediato llama al 911. Si estás en otro país, usa tu número local de emergencias.

Si puedes, aléjate de medios con los que podrías hacer daño y contacta a una persona de confianza para no estar a solas con esto.

¿Estás en un lugar seguro ahora?`;
}
