import Actor from "@/actor/Actor";

export interface BaseMilestoneConfig {
  attain_on: MilestoneAttainOn;
  type: MilestoneType;
}

interface NewTeamMemberMilestoneConfig extends BaseMilestoneConfig {
  type: MilestoneType.NewTeamMember;
}

export type MilestoneConfig = NewTeamMemberMilestoneConfig;

export enum MilestoneType {
  None,
  NewTeamMember,
}

export enum MilestoneAttainOn {
  None,
  DialogueComplete,
}

/** Relevant data relating to milestone being attained */
export interface MilestoneResolution {
  actor?: Actor;
}
