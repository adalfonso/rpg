import { Speech, SpeechList } from "./types";

/** All non-players contained in the game */
export const speech_list: SpeechList = {
  pisti: {
    pisti_meet: {
      dialogue: ["Hi poost.", "Want a puppuccino?"],
    },
  },
};

/**
 * Lookup speech for a type/name
 *
 * @param ref - dot notation ref of type.name
 * @returns speech or undefined
 */
export const getSpeech = (
  ref: string,
  lookup: SpeechList = speech_list
): Speech | undefined => {
  const [type, name] = ref.split(".");

  if (type === undefined || name === undefined) {
    return undefined;
  }

  return lookup[type]?.[name];
};
