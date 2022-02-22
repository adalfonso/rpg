import {
  MilestoneConfig,
  MilestoneAttainOn as AttainOn,
  MilestoneType,
} from "./types";

export type MilestoneConfigList = Record<string, MilestoneConfig>;

export const milestone_list: MilestoneConfigList = {
  "team_member.join.pisti": {
    attain_on: AttainOn.DialogueComplete,
    type: MilestoneType.NewTeamMember,
  },
};
